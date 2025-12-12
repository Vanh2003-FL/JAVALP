/*
 * Copyright 2017, OpenRemote Inc.
 *
 * See the CONTRIBUTORS.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.openremote.manager.asset;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.validation.ConstraintViolation;
import org.apache.camel.Exchange;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.builder.RouteConfigurationBuilder;
import org.openremote.container.message.MessageBrokerService;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.container.util.MapAccess;
import org.openremote.manager.agent.AgentService;
import org.openremote.manager.datapoint.AssetDatapointService;
import org.openremote.manager.event.AttributeEventInterceptor;
import org.openremote.manager.event.ClientEventService;
import org.openremote.manager.event.EventSubscriptionAuthorizer;
import org.openremote.manager.gateway.GatewayService;
import org.openremote.manager.notification.NotificationService;
import org.openremote.manager.rules.RulesService;
import org.openremote.manager.scheduleInfo.ScheduleInfoPersistenceService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.warning.WarningEmailConfigPersistenceService;
import org.openremote.model.Constants;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.asset.Asset;
import org.openremote.model.attribute.Attribute;
import org.openremote.model.attribute.AttributeEvent;
import org.openremote.model.attribute.AttributeRef;
import org.openremote.model.attribute.MetaItem;
import org.openremote.model.hdi.hdiDTO.*;
import org.openremote.model.hdi.hdiDTO.commandDTO.LightCommand254State;
import org.openremote.model.hdi.hdiDTO.commandDTO.LightCommand3Control2;
import org.openremote.model.hdi.hdiEven.HdiEven;
import org.openremote.model.notification.EmailNotificationMessage;
import org.openremote.model.notification.Notification;
import org.openremote.model.notification.RepeatFrequency;
import org.openremote.model.query.AssetQuery;
import org.openremote.model.scheduleinfo.ScheduleAsset;
import org.openremote.model.scheduleinfo.ScheduleInfo;
import org.openremote.model.security.ClientRole;
import org.openremote.model.util.ValueUtil;
import org.openremote.model.value.MetaItemType;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.RejectedExecutionException;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.openremote.manager.system.HealthService.OR_CAMEL_ROUTE_METRIC_PREFIX;
import static org.openremote.model.attribute.AttributeWriteFailure.*;

/**
 * Receives {@link AttributeEvent} from various sources (clients and services) and processes them.
 * An {@link AttributeEventInterceptor} can register to intercept the events using {@link #addEventInterceptor} at which
 * point they can decide whether or not to allow the event to continue being processed or not.
 * <p>
 * Any {@link AttributeEvent}s that fail to be processed will generate an {@link AssetProcessingException} which will be
 * logged; there is currently no dead letter queue or retry processing.
 * <p>
 * <h2>Rules Service processing logic</h2>
 * <p>
 * Checks if attribute has {@link MetaItemType#RULE_STATE} and/or {@link MetaItemType#RULE_EVENT} {@link MetaItem}s,
 * and if so the message is passed through the rule engines that are in scope for the asset.
 * <p>
 * <h2>Asset Storage Service processing logic</h2>
 * <p>
 * Always tries to persist the attribute value in the database and allows the message to continue if the commit was
 * successful.
 * <h2>Asset Datapoint Service processing logic</h2>
 * <p>
 * Checks if attribute has {@link MetaItemType#STORE_DATA_POINTS} set to false or if the attribute does not have an
 * {@link org.openremote.model.asset.agent.AgentLink} meta, and if so the {@link AttributeEvent}
 * is not stored in a time series DB of historical data, otherwise the value is stored. Then allows the message to
 * continue if the commit was successful.
 */
public class AssetProcessingService extends RouteBuilder implements ContainerService {

    public static final String ATTRIBUTE_EVENT_ROUTE_CONFIG_ID = "attributeEvent";
    public static final int PRIORITY = AssetStorageService.PRIORITY + 1000;
    public static final String ATTRIBUTE_EVENT_ROUTER_QUEUE = "seda://AttributeEventRouter?waitForTaskToComplete=IfReplyExpected&timeout=10000&purgeWhenStopping=false&discardIfNoConsumers=false&size=10000";
    public static final String OR_ATTRIBUTE_EVENT_THREADS = "OR_ATTRIBUTE_EVENT_THREADS";
    public static final int OR_ATTRIBUTE_EVENT_THREADS_DEFAULT = Runtime.getRuntime().availableProcessors();
    protected static final String EVENT_ROUTE_COUNT_HEADER = "EVENT_ROUTE_COUNT_HEADER";
    protected static final String EVENT_PROCESSOR_URI_PREFIX = "seda://AttributeEventProcessor";
    protected static final String EVENT_PROCESSOR_URI_SUFFIX = "?size=3000&timeout=15000";
    public static final String EVENT_PROCESSOR_ROUTE_ID_PREFIX = "AttributeEvent-Processor";
    private static final System.Logger LOG = System.getLogger(AssetProcessingService.class.getName());
    public static final String ELECTRICAL_CABINET_ASSET = "ElectricalCabinetAsset";
    public static final String power_sts_1 = "power_sts_1";
    public static final String power_sts_2 = "power_sts_2";
    public static final String power_sts_3 = "power_sts_3";
    public static final String ROAD_ASSET = "RoadAsset";
    public static final String FIXED_GROUP_ASSET = "FixedGroupAsset";
    public static final String LIGHT_ASSET = "LightAsset";
    public static final String LIGHT_GROUP_ASSET = "LightGroupAsset";
    public static final String NOTES = "notes";
    public static final String LOCATION = "location";
    public static final String BRIGHTNESS = "brightness";
    public static final String U = "voltage";
    public static final String I = "amperage";
    public static final String E = "wattageActual";
    public static final String P = "wattage";
    public static final String COSPHI = "cosPhi";
    public static final String STATUS = "assetStatus";


    final protected List<AttributeEventInterceptor> eventInterceptors = new ArrayList<>();
    protected TimerService timerService;
    protected ManagerIdentityService identityService;
    protected PersistenceService persistenceService;
    protected RulesService rulesService;
    protected AgentService agentService;
    protected GatewayService gatewayService;
    protected AssetStorageService assetStorageService;
    protected AssetDatapointService assetDatapointService;
    protected AttributeLinkingService assetAttributeLinkingService;
    protected MessageBrokerService messageBrokerService;
    protected ClientEventService clientEventService;
    protected NotificationService notificationService;
    // Used in testing to detect if initial/startup processing has completed
    protected long lastProcessedEventTimestamp = System.currentTimeMillis();
    protected int eventProcessingThreadCount;
    protected Counter queueFullCounter;
    protected ScheduleInfoPersistenceService scheduleInfoPersistenceService;


    protected final static String[] publicAsset = {ELECTRICAL_CABINET_ASSET, ROAD_ASSET};

    protected boolean isPublicAsset(String assetType) {
        return Arrays.stream(publicAsset)
                .anyMatch(assetType::matches);
    }

    protected final static String[] publicAttribute = {power_sts_1, power_sts_2, power_sts_3};

    protected boolean isPublicAttribute(String assetType) {
        return Arrays.stream(publicAttribute)
                .anyMatch(assetType::matches);
    }

    @Override
    public int getPriority() {
        return PRIORITY;
    }

    protected WarningEmailConfigPersistenceService warningEmailConfigPersistenceService;

    @Override
    public void init(Container container) throws Exception {
        timerService = container.getService(TimerService.class);
        identityService = container.getService(ManagerIdentityService.class);
        persistenceService = container.getService(PersistenceService.class);
        rulesService = container.getService(RulesService.class);
        agentService = container.getService(AgentService.class);
        gatewayService = container.getService(GatewayService.class);
        assetStorageService = container.getService(AssetStorageService.class);
        assetDatapointService = container.getService(AssetDatapointService.class);
        assetAttributeLinkingService = container.getService(AttributeLinkingService.class);
        messageBrokerService = container.getService(MessageBrokerService.class);
        clientEventService = container.getService(ClientEventService.class);
        warningEmailConfigPersistenceService = container.getService(WarningEmailConfigPersistenceService.class);
        scheduleInfoPersistenceService = container.getService(ScheduleInfoPersistenceService.class);
        notificationService = container.getService(NotificationService.class);

        MeterRegistry meterRegistry = container.getMeterRegistry();
        EventSubscriptionAuthorizer assetEventAuthorizer = AssetStorageService.assetInfoAuthorizer(identityService, assetStorageService);

        if (meterRegistry != null) {
            queueFullCounter = meterRegistry.counter(OR_CAMEL_ROUTE_METRIC_PREFIX + "_failed_queue_full", Tags.empty());
        }

        clientEventService.addSubscriptionAuthorizer((requestedRealm, auth, subscription) -> {
            if (!subscription.isEventType(AttributeEvent.class)) {
                return false;
            }
            return assetEventAuthorizer.authorise(requestedRealm, auth, subscription);
        });

        // TODO: Introduce caching here similar to ActiveMQ auth caching
        clientEventService.addEventAuthorizer((requestedRealm, authContext, event) -> {

            if (!(event instanceof AttributeEvent attributeEvent)) {
                return false;
            }

            if (authContext != null && authContext.isSuperUser()) {
                return true;
            }

            // Check realm against user
            if (!identityService.getIdentityProvider().isRealmActiveAndAccessible(authContext,
                    requestedRealm)) {
                LOG.log(System.Logger.Level.INFO, "Realm is inactive, inaccessible or nonexistent: " + requestedRealm);
                return false;
            }

            // Users must have write attributes role
            if (authContext != null && !authContext.hasResourceRoleOrIsSuperUser(ClientRole.WRITE_ATTRIBUTES.getValue(),
                    Constants.KEYCLOAK_CLIENT_ID)) {
                LOG.log(System.Logger.Level.DEBUG, "User doesn't have required role '" + ClientRole.WRITE_ATTRIBUTES + "': username=" + authContext.getUsername() + ", userRealm=" + authContext.getAuthenticatedRealmName());
                return false;
            }

            // Have to load the asset and attribute to perform additional checks - should permissions be moved out of the
            // asset model (possibly if the performance is determined to be not good enough)
            // TODO: Use a targeted query to retrieve just the info we need
            Asset<?> asset = assetStorageService.find(attributeEvent.getId());
            Attribute<?> attribute = asset != null ? asset.getAttribute(attributeEvent.getName()).orElse(null) : null;

            if (asset == null || !asset.hasAttribute(attributeEvent.getName())) {
                LOG.log(System.Logger.Level.INFO, () -> "Cannot authorize asset event as asset and/or attribute doesn't exist: " + attributeEvent.getRef());
                return false;
            } else if (!Objects.equals(requestedRealm, asset.getRealm())) {
                LOG.log(System.Logger.Level.INFO, () -> "Asset is not in the requested realm: requestedRealm=" + requestedRealm + ", ref=" + attributeEvent.getRef());
                return false;
            }

            if (authContext != null) {
                // Check restricted user
                if (identityService.getIdentityProvider().isRestrictedUser(authContext)) {
                    // Must be asset linked to user
                    if (!assetStorageService.isUserAsset(authContext.getUserId(),
                            attributeEvent.getId())) {
                        LOG.log(System.Logger.Level.DEBUG, () -> "Restricted user is not linked to asset '" + attributeEvent.getId() + "': username=" + authContext.getUsername() + ", userRealm=" + authContext.getAuthenticatedRealmName());
                        return false;
                    }

                    if (attribute == null || !attribute.getMetaValue(MetaItemType.ACCESS_RESTRICTED_WRITE).orElse(false)) {
                        LOG.log(System.Logger.Level.DEBUG, () -> "Asset attribute doesn't support restricted write on '" + attributeEvent.getRef() + "': username=" + authContext.getUsername() + ", userRealm=" + authContext.getAuthenticatedRealmName());
                        return false;
                    }
                }
            } else {
                // Check attribute has public write flag for anonymous write
                if (attribute == null || !attribute.hasMeta(MetaItemType.ACCESS_PUBLIC_WRITE)) {
                    LOG.log(System.Logger.Level.DEBUG, () -> "Asset doesn't support public write on '" + attributeEvent.getRef() + "': username=null");
                    return false;
                }
            }

            return true;
        });

        // Get dynamic route count for event processing (multithreaded event processing but guaranteeing events for the same asset end up in the same route)
        eventProcessingThreadCount = MapAccess.getInteger(container.getConfig(), OR_ATTRIBUTE_EVENT_THREADS, OR_ATTRIBUTE_EVENT_THREADS_DEFAULT);
        if (eventProcessingThreadCount < 1) {
            LOG.log(System.Logger.Level.WARNING, OR_ATTRIBUTE_EVENT_THREADS + " value " + eventProcessingThreadCount + " is less than 1; forcing to 1");
            eventProcessingThreadCount = 1;
        } else if (eventProcessingThreadCount > 20) {
            LOG.log(System.Logger.Level.WARNING, OR_ATTRIBUTE_EVENT_THREADS + " value " + eventProcessingThreadCount + " is greater than max value of 20; forcing to 20");
            eventProcessingThreadCount = 20;
        }

        // Add exception handling for attribute event processing that logs queue full exceptions and counts them
        messageBrokerService.getContext().addRoutesConfigurations(new RouteConfigurationBuilder() {
            @SuppressWarnings("unchecked")
            @Override
            public void configuration() throws Exception {
                routeConfiguration(ATTRIBUTE_EVENT_ROUTE_CONFIG_ID)
                        .onException(IllegalStateException.class, RejectedExecutionException.class, AssetProcessingException.class)
                        .handled(true)
                        .logExhausted(false)
                        .logStackTrace(false)
                        .process(exchange -> {
                            AttributeEvent event = exchange.getIn().getBody(AttributeEvent.class);
                            Exception exception = exchange.getProperty(Exchange.EXCEPTION_CAUGHT, Exception.class);

                            if (exception instanceof RejectedExecutionException || (exception instanceof IllegalStateException illegalStateException && "Queue full".equals(illegalStateException.getMessage()))) {
                                exception = new AssetProcessingException(QUEUE_FULL, "Queue for this event is full");
                                if (queueFullCounter != null) {
                                    queueFullCounter.increment();
                                }
                            }

                            // Make the exception available if MEP is InOut
                            exchange.getMessage().setBody(exception);

                            if (!LOG.isLoggable(System.Logger.Level.WARNING)) {
                                return;
                            }

                            StringBuilder error = new StringBuilder("Error processing from ");

                            if (event.getSource() != null) {
                                error.append(event.getSource());
                            } else {
                                error.append("N/A");
                            }

                            error.append(": ").append(event.toStringWithValueType());

                            if (exception instanceof AssetProcessingException processingException) {
                                error.append(" ").append(" - ").append(processingException.getMessage());
                                if (processingException.getReason() == ASSET_NOT_FOUND) {
                                    LOG.log(System.Logger.Level.DEBUG, error::toString);
                                } else {
                                    LOG.log(System.Logger.Level.WARNING, error::toString);
                                }
                            } else {
                                LOG.log(System.Logger.Level.WARNING, error::toString, exception);
                            }
                        });
            }
        });

        messageBrokerService.getContext().addRoutes(this);
    }

    @Override
    public void start(Container container) throws Exception {
    }

    @Override
    public void stop(Container container) throws Exception {
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    @Override
    public void configure() throws Exception {

        // All user authorisation checks MUST have been carried out before events reach this queue

        // Router is responsible for routing events to the same processor for a given asset ID, this allows for
        // multithreaded processing across assets
        from(ATTRIBUTE_EVENT_ROUTER_QUEUE)
                .routeId("AttributeEvent-Router")
                .routeConfigurationId(ATTRIBUTE_EVENT_ROUTE_CONFIG_ID)
                .process(exchange -> {
                    AttributeEvent event = exchange.getIn().getBody(AttributeEvent.class);

                    if (event.getId() == null || event.getId().isEmpty())
                        return; // Ignore events with no asset ID
                    if (event.getName() == null || event.getName().isEmpty())
                        return; // Ignore events with no attribute name

                    if (event.getTimestamp() <= 0) {
                        // Set timestamp if not set
                        event.setTimestamp(timerService.getCurrentTimeMillis());
                    } else if (event.getTimestamp() > timerService.getCurrentTimeMillis()) {
                        // Use system time if event time is in the future (clock issue)
                        event.setTimestamp(timerService.getCurrentTimeMillis());
                    }

                    exchange.getIn().setHeader(EVENT_ROUTE_COUNT_HEADER, getEventProcessingRouteNumber(event.getId()));
                })
                .toD(EVENT_PROCESSOR_URI_PREFIX + "${header." + EVENT_ROUTE_COUNT_HEADER + "}");

        // Create the event processor routes
        IntStream.rangeClosed(1, eventProcessingThreadCount).forEach(processorCount -> {
            String camelRouteURI = getEventProcessingRouteURI(processorCount);

            from(camelRouteURI)
                    .routeId(EVENT_PROCESSOR_ROUTE_ID_PREFIX + processorCount)
                    .routeConfigurationId(ATTRIBUTE_EVENT_ROUTE_CONFIG_ID)
                    .process(exchange -> {
                        AttributeEvent event = exchange.getIn().getBody(AttributeEvent.class);
                        LOG.log(System.Logger.Level.TRACE, () -> ">>> Attribute event processing start: processor=" + processorCount + ", event=" + event);
                        long startMillis = System.currentTimeMillis();
                        boolean processed = processAttributeEvent(event);
                        boolean powered = processPowerEvent(event);
                        // Need to record time here otherwise an infinite loop generated inside one of the interceptors means the timestamp
                        // is not updated so tests can't then detect the problem.
                        lastProcessedEventTimestamp = startMillis;

                        long processingMillis = System.currentTimeMillis() - startMillis;

                        if (processingMillis > 50) {
                            LOG.log(System.Logger.Level.INFO, () -> "<<< Attribute event processing took a long time " + processingMillis + "ms: processor=" + processorCount + ", event=" + event);
                        } else {
                            LOG.log(System.Logger.Level.DEBUG, () -> "<<< Attribute event processed in " + processingMillis + "ms: processor=" + processorCount + ", event=" + event);
                        }

                        exchange.getIn().setBody(processed);
                    });
        });
    }

    private boolean processPowerEvent(AttributeEvent event) {
//        if (asset.getType().equals(LIGHT_GROUP_ASSET) && event.getName().equals(BRIGHTNESS)){
//            Map<String, List<LightCommand3Control2>> groupedResults = assetStorageService.usrSpGetAssetInfoListByParentId(em,event.getId());
//            groupedResults.forEach((key, valueV) -> {
//                AttributeEvent enrichedElectricalCabinetEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));
//                enrichedElectricalCabinetEvent.setAssetCode(key);
//                if (!dimmingAllLightInCabinet(valueV, em, enrichedElectricalCabinetEvent)) {
//                    throw new AssetProcessingException(
//                            CANNOT_PROCESS, "CANNOT_PROCESS"
//                    );
//                }
//            });
//        }
        return true;
    }

    public void addEventInterceptor(AttributeEventInterceptor eventInterceptor) {
        eventInterceptors.add(eventInterceptor);
        eventInterceptors.sort(Comparator.comparingInt(AttributeEventInterceptor::getPriority));
    }

    /**
     * Send internal attribute change events into the {@link #ATTRIBUTE_EVENT_ROUTER_QUEUE}.
     */
    public void sendAttributeEvent(AttributeEvent attributeEvent) {
        sendAttributeEvent(attributeEvent, null);
    }

    /**
     * Send internal attribute change events into the {@link #ATTRIBUTE_EVENT_ROUTER_QUEUE}.
     */
    public void sendAttributeEvent(AttributeEvent attributeEvent, Object source) {
        attributeEvent.setSource(source);

        // Set event source time if not already set
        if (attributeEvent.getTimestamp() <= 0) {
            attributeEvent.setTimestamp(timerService.getCurrentTimeMillis());
        }
        messageBrokerService.getFluentProducerTemplate()
                .withBody(attributeEvent)
                .to(ATTRIBUTE_EVENT_ROUTER_QUEUE)
                .asyncSend();
    }

    /**
     * The {@link AttributeEvent} is passed to each registered {@link AttributeEventInterceptor} and if no interceptor
     * handles the event then the {@link Attribute} value is updated in the DB with the new event value and timestamp.
     */
    protected boolean processAttributeEvent(AttributeEvent event) throws AssetProcessingException {
        // TODO: Get asset lock so it cannot be modified during event processing
        persistenceService.doTransaction(em -> {


            // TODO: Retrieve optimised DTO rather than whole asset
            Asset<?> asset = assetStorageService.find(em, event.getId(), true);
            if (asset == null) {
                throw new AssetProcessingException(ASSET_NOT_FOUND, "Asset may have been deleted before event could be processed or it never existed");
            }

            String assetCode = event.getAssetCode();
            if (assetCode == null || assetCode.isEmpty()) {
                List<?> codes = assetStorageService.getAssetCodeByAssetId(event.getId());
                if (!codes.isEmpty()) {
                    event.setAssetCode((String) codes.get(0));
                }
            }

            Attribute<Object> attribute = asset.getAttribute(event.getName()).orElseThrow(() ->
                    new AssetProcessingException(ATTRIBUTE_NOT_FOUND, "Attribute may have been deleted before event could be processed or it never existed"));

            //viet hdi begin
            if (event.getValue().orElseThrow(() -> new RuntimeException("event.getValue() null")).getClass() == LinkedHashMap.class) {
                ObjectMapper objectMapper = new ObjectMapper();
                // Chuyển đổi LinkedHashMap thành đối tượng kiểu MyClass
                HdiCmdDataExtends hdiCmdData = objectMapper.convertValue(event.getValue().orElse(null), HdiCmdDataExtends.class);

                if (hdiCmdData != null && hdiCmdData.getCmd() == 254 && hdiCmdData.getData().equals("state")) {
                    Hdi254StateDe hdi254StateDe = objectMapper.convertValue(event.getValue().orElse(new Hdi254StateDe()), Hdi254StateDe.class);
                    event.setValue(hdi254StateDe);
                    AttributeEvent enrichedEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));

                    if (!handle254DataDeCommandClient(em, enrichedEvent)) {
                        throw new AssetProcessingException(
                                STATE_STORAGE_FAILED, "database update failed, no rows updated"
                        );
                    }
                }

                if (hdiCmdData != null && hdiCmdData.getCmd() == 3 && hdiCmdData.getData().equals("scene")) {
                    Hdi3SceneSe hdi3SceneSe = objectMapper.convertValue(event.getValue().orElse(new Hdi3SceneSe()), Hdi3SceneSe.class);

                    if (
                            !handle3SceneCommandClient(hdi3SceneSe, event)
                    ) {
                        throw new AssetProcessingException(
                                STATE_STORAGE_FAILED, "database update failed, no rows updated"
                        );
                    }
                }

                if (hdiCmdData != null && hdiCmdData.getCmd() == 254 && hdiCmdData.getData().equals("power")) {
                    Hdi254PowerDe hdi254PowerDe = objectMapper.convertValue(event.getValue().orElse(new Hdi254PowerDe()), Hdi254PowerDe.class);
                    event.setValue(hdi254PowerDe);
                    AttributeEvent enrichedEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));

                    if (!handle254PowerDeCommandClient(enrichedEvent)) {
                        throw new AssetProcessingException(
                                STATE_STORAGE_FAILED, "database update failed, no rows updated"
                        );
                    }
                }

                if (hdiCmdData != null && hdiCmdData.getCmd() == 250 && hdiCmdData.getData().equals("timestamp")) {
                    SimpleDateFormat formatter = new SimpleDateFormat("EEE MMM dd HH:mm:ss yyyy");
                    Date now = new Date();
                    String formattedDate = formatter.format(now);

                    Hdi250DataDe hdi250DataDe = new Hdi250DataDe(formattedDate);
                    HdiEven hdiEven = new HdiEven(hdi250DataDe);
                    hdiEven.setAssetCode(event.getAssetCode());
                    clientEventService.publishEvent(hdiEven);
                }

                if (hdiCmdData != null && hdiCmdData.getCmd() == 253 && hdiCmdData.getData().equals("update")) {
                    Hdi253Update hdi253Update = objectMapper.convertValue(event.getValue().orElse(new Hdi253Update()), Hdi253Update.class);
                    event.setValue(hdi253Update);
                    AttributeEvent enrichedEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));
//
                    if (!handle253DataUpdateCommandClient(em, enrichedEvent)) {
                        throw new AssetProcessingException(
                                STATE_STORAGE_FAILED, "database update failed, no rows updated"
                        );
                    }
                }
                if (hdiCmdData != null && hdiCmdData.getCmd() == 255 && hdiCmdData.getData().equals("scene")) {
                    Hdi255SceneDe hdi255SceneDe = objectMapper.convertValue(event.getValue().orElse(new Hdi255SceneDe()), Hdi255SceneDe.class);
                    event.setValue(hdi255SceneDe);
                    AttributeEvent enrichedEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));
//
                    if (!handle255SceneCommandClient(em, enrichedEvent)) {
                        throw new AssetProcessingException(
                                STATE_STORAGE_FAILED, "database update failed, no rows updated"
                        );
                    }
                }

                if (hdiCmdData != null && hdiCmdData.getCmd() == 255 && hdiCmdData.getData().equals("scene_clear")) {
                    Hdi255SceneClearDe hdi255SceneClearDe = objectMapper.convertValue(event.getValue().orElse(new Hdi255SceneClearDe()), Hdi255SceneClearDe.class);
                    event.setValue(hdi255SceneClearDe);
                    AttributeEvent enrichedEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));
//
                    if (!handle255SceneClearCommandClient(em, enrichedEvent)) {
                        throw new AssetProcessingException(
                                STATE_STORAGE_FAILED, "database update failed, no rows updated"
                        );
                    }
                }


                return;
            }
            // //viet hdi end

            // Type coercion
            Object value = event.getValue().map(eventValue -> {
                Class<?> attributeValueType = attribute.getTypeClass();
                return ValueUtil.getValueCoerced(eventValue, attributeValueType).orElseThrow(() -> {
                    String msg = "Event processing failed unable to coerce value into the correct value type: realm=" + event.getRealm() + ", attribute=" + event.getRef() + ", event value type=" + eventValue.getClass() + ", attribute value type=" + attributeValueType;
                    return new AssetProcessingException(INVALID_VALUE, msg);
                });
            }).orElse(null);
            event.setValue(value);

            AttributeEvent enrichedEvent = new AttributeEvent(event.isSend(), asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));

            // Do standard JSR-380 validation on the event
            Set<ConstraintViolation<AttributeEvent>> validationFailures = ValueUtil.validate(enrichedEvent);

            if (!validationFailures.isEmpty()) {
                String msg = "Event processing failed value failed constraint validation: realm=" + enrichedEvent.getRealm() + ", attribute=" + enrichedEvent.getRef() + ", event value type=" + enrichedEvent.getValue().map(v -> v.getClass().getName()).orElse("null") + ", attribute value type=" + enrichedEvent.getTypeClass();
                throw new AssetProcessingException(INVALID_VALUE, msg);
            }

            // TODO: Remove AttributeExecuteStatus
//            // For executable attributes, non-sensor sources can set a writable attribute execute status
//            if (attribute.getType() == ValueType.EXECUTION_STATUS && source != SENSOR) {
//                Optional<AttributeExecuteStatus> status = event.getValue()
//                    .flatMap(ValueUtil::getString)
//                    .flatMap(AttributeExecuteStatus::fromString);
//
//                if (status.isPresent() && !status.get().isWrite()) {
//                    throw new AssetProcessingException(INVALID_ATTRIBUTE_EXECUTE_STATUS);
//                }
//            }

            String interceptorName = null;
            boolean intercepted = false;

            for (AttributeEventInterceptor interceptor : eventInterceptors) {
                try {
                    intercepted = interceptor.intercept(em, enrichedEvent);
                } catch (AssetProcessingException ex) {
                    throw new AssetProcessingException(ex.getReason(), "Interceptor '" + interceptor + "' error=" + ex.getMessage());
                } catch (Throwable t) {
                    throw new AssetProcessingException(
                            INTERCEPTOR_FAILURE,
                            "Interceptor '" + interceptor + "' uncaught exception error=" + t.getMessage(),
                            t
                    );
                }
                if (intercepted) {
                    interceptorName = interceptor.getName();
                    break;
                }
            }

            if (intercepted) {
                LOG.log(System.Logger.Level.ERROR, "Log 1: intercrept " + intercepted);

                LOG.log(System.Logger.Level.TRACE, "Event intercepted: interceptor=" + interceptorName + ", ref=" + enrichedEvent.getRef() + ", source=" + enrichedEvent.getSource());
            } else {
                if (enrichedEvent.isOutdated()) {
                    LOG.log(System.Logger.Level.INFO, () -> "Event is older than current attribute value so marking as outdated: ref=" + enrichedEvent.getRef() + ", event=" + Instant.ofEpochMilli(enrichedEvent.getTimestamp()) + ", previous=" + Instant.ofEpochMilli(enrichedEvent.getOldValueTimestamp()));
                    // Generate an event for this so internal subscribers can act on it if needed
                    clientEventService.publishEvent(new OutdatedAttributeEvent(enrichedEvent));
                    LOG.log(System.Logger.Level.ERROR, "Log 2: enrichedEvent.isOutdated() " + enrichedEvent.isOutdated());

                } else {

                    //viet hdi begin
                    if (isPublicAsset(asset.getType()) && event.getName().equals(BRIGHTNESS)) {
                        Map<String, List<LightCommand3Control2>> groupedResults = assetStorageService.usrSpGetAssetInfoListByParentIdGroupLightAsset(em, event.getId());
                        groupedResults.forEach((key, valueV) -> {
                            AttributeEvent enrichedElectricalCabinetEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));
                            enrichedElectricalCabinetEvent.setAssetCode(key);
                            if (!dimmingAllGroupLight(valueV, em, enrichedElectricalCabinetEvent)) {
                                throw new AssetProcessingException(
                                        CANNOT_PROCESS, "CANNOT_PROCESS"
                                );
                            }
                        });

                    }


                    if (asset.getType().equals(ELECTRICAL_CABINET_ASSET) && isPublicAttribute(event.getName()) && !event.isSend()) {
                        LOG.log(System.Logger.Level.ERROR, "Log 3: " );

                        String power1;
                        if (event.getName().equals(power_sts_1)) {
                            power1 = String.valueOf(value);
                        } else {
                            LOG.log(System.Logger.Level.ERROR, "Log 4: " );
                            Attribute<Object> attribute1 = asset.getAttribute(power_sts_1).orElseThrow(() ->
                                    new AssetProcessingException(ATTRIBUTE_NOT_FOUND, "Attribute may have been deleted before event could be processed or it never existed"));
                            power1 = String.valueOf(attribute1.getValue().orElseGet(() -> null));
                        }
                        String power2;
                        if (event.getName().equals(power_sts_2)) {
                            power2 = String.valueOf(value);
                        } else {
                            LOG.log(System.Logger.Level.ERROR, "Log 5: " );
                            Attribute<Object> attribute2 = asset.getAttribute(power_sts_2).orElseThrow(() ->
                                    new AssetProcessingException(ATTRIBUTE_NOT_FOUND, "Attribute may have been deleted before event could be processed or it never existed"));
                            power2 = String.valueOf(attribute2.getValue().orElseGet(() -> null));

                        }
                        String power3;
                        if (event.getName().equals(power_sts_3)) {
                            power3 = String.valueOf(value);
                        } else {
                            LOG.log(System.Logger.Level.ERROR, "Log 6: " );
                            Attribute<Object> attribute3 = asset.getAttribute(power_sts_3).orElseThrow(() ->
                                    new AssetProcessingException(ATTRIBUTE_NOT_FOUND, "Attribute may have been deleted before event could be processed or it never existed"));
                            power3 = String.valueOf(attribute3.getValue().orElseGet(() -> null));
                        }

                        HdiEven hdiEven = new HdiEven(new Hdi3Power(String.join("-", power1, power2, power3)));
                        hdiEven.setAssetCode(event.getAssetCode());
                        clientEventService.publishEvent(hdiEven);
                    }

                    if (asset.getType().equals(LIGHT_GROUP_ASSET) && event.getName().equals(BRIGHTNESS)) {
                        Map<String, List<LightCommand3Control2>> groupedResults = assetStorageService.usrSpGetAssetInfoListByParentId(em, event.getId());
                        groupedResults.forEach((key, valueV) -> {
                            AttributeEvent enrichedElectricalCabinetEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));
                            enrichedElectricalCabinetEvent.setAssetCode(key);
                            if (!dimmingAllLightInCabinet(valueV, em, enrichedElectricalCabinetEvent)) {
                                throw new AssetProcessingException(
                                        CANNOT_PROCESS, "CANNOT_PROCESS"
                                );
                            }
                        });
                    }


                    if (asset.getType().equals(LIGHT_ASSET) && event.getName().equals(BRIGHTNESS) && !event.isSend()) {
                        Map<String, List<LightCommand3Control2>> groupedResults = assetStorageService.usrSpGetAssetInfoListByParentId(em, event.getId());
                        groupedResults.forEach((key, valueV) -> {
                            AttributeEvent enrichedElectricalCabinetEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));
                            enrichedElectricalCabinetEvent.setAssetCode(key);
                            if (!dimmingLight(valueV, em, enrichedElectricalCabinetEvent)) {
                                throw new AssetProcessingException(
                                        CANNOT_PROCESS, "    CANNOT_PROCESS"
                                );
                            }
                        });
                    }

                    if (asset.getType().equals(FIXED_GROUP_ASSET) && event.getName().equals(BRIGHTNESS) && !event.isSend()) {
                        Map<String, List<LightCommand3Control2>> groupedResults = assetStorageService.usrSpGetAssetInfoListByParentIdGroupLightAsset(em, event.getId());
                        groupedResults.forEach((key, valueV) -> {
                            AttributeEvent enrichedElectricalCabinetEvent = new AttributeEvent(asset, attribute, event.getSource(), event.getValue().orElse(null), event.getTimestamp(), attribute.getValue().orElse(null), attribute.getTimestamp().orElse(0L));
                            enrichedElectricalCabinetEvent.setAssetCode(key);
                            if (!dimmingLightGroup(valueV, em, enrichedElectricalCabinetEvent)) {
                                throw new AssetProcessingException(
                                        CANNOT_PROCESS, "CANNOT_PROCESS"
                                );
                            }
                        });
                    }
                    //viet hdi end
                    if (!assetStorageService.updateAttributeValue(em, enrichedEvent)) {
                        throw new AssetProcessingException(
                                STATE_STORAGE_FAILED, "database update failed, no rows updated"
                        );
                    }
                }
            }
        });

        return true;
    }

    private boolean handle3SceneCommandClient(Hdi3SceneSe hdi3SceneSe, AttributeEvent even) {

        List<?> scheduleInfos = persistenceService.doReturningTransaction(entityManager -> entityManager.createQuery("select si.id from ScheduleInfo as si where si.scheduleCode=:id")
                .setParameter("id", hdi3SceneSe.getScene_id().toString())
                .getResultList());

        if (!scheduleInfos.isEmpty()) {
            List<Asset<?>> assets = assetStorageService.getAssetByAssetCode(even.getAssetCode());
            ScheduleInfo info = ScheduleInfo.fromHdi3SceneSe(hdi3SceneSe, assets.get(0).getRealm(), "DE", "DE");
            info.setScheduleName(hdi3SceneSe.getScene_name());
            info.setId((Integer) scheduleInfos.get(0));

            ScheduleAsset scheduleAsset = new ScheduleAsset();
            scheduleAsset.setDirectAssetId(assets.get(0).getId());
            scheduleAsset.setAssetTypeCode("ECA");
            scheduleAsset.setAssetTypeName(assets.get(0).getType());
            scheduleAsset.setAssetName(assets.get(0).getName());
            scheduleAsset.setDirectSysAssetId("2");

            info.setScheduleAssets(List.of(scheduleAsset));

            scheduleInfoPersistenceService.update(info);
        } else {
            List<Asset<?>> assets = assetStorageService.getAssetByAssetCode(even.getAssetCode());
            ScheduleInfo info = ScheduleInfo.fromHdi3SceneSe(hdi3SceneSe, assets.get(0).getRealm(), "DE", "DE");
            info.setScheduleName(hdi3SceneSe.getScene_name());

            ScheduleAsset scheduleAsset = new ScheduleAsset();
            scheduleAsset.setDirectAssetId(assets.get(0).getId());
            scheduleAsset.setAssetTypeCode("ECA");
            scheduleAsset.setAssetTypeName(assets.get(0).getType());
            scheduleAsset.setAssetName(assets.get(0).getName());
            scheduleAsset.setDirectSysAssetId("2");

            info.setScheduleAssets(List.of(scheduleAsset));
            scheduleInfoPersistenceService.create(info);
        }
        HdiEven hdiEven = new HdiEven(hdi3SceneSe);
        hdiEven.setAssetCode("publish");
        clientEventService.publishEvent(hdiEven);
        return true;
    }

    private boolean handle254PowerDeCommandClient(AttributeEvent enrichedEvent) {
        Hdi254PowerDe hdi254PowerDe = (Hdi254PowerDe) enrichedEvent.getValue().orElse(null);
        assert hdi254PowerDe != null;
        String[] strings = Arrays.stream(hdi254PowerDe.getRelay().split("-")).map(String::trim).toArray(String[]::new);
        AttributeEvent event1 = new AttributeEvent(new AttributeRef(enrichedEvent.getId(), power_sts_1), Integer.valueOf(strings[0]));
        event1.setSend(true);
        sendAttributeEvent(event1);

        AttributeEvent event2 = new AttributeEvent(new AttributeRef(enrichedEvent.getId(), power_sts_2), Integer.valueOf(strings[1]));
        event2.setSend(true);
        sendAttributeEvent(event2);

        AttributeEvent event3 = new AttributeEvent(new AttributeRef(enrichedEvent.getId(), power_sts_3), Integer.valueOf(strings[2]));
        event3.setSend(true);
        sendAttributeEvent(event3);

//        AttributeEvent event4 = new AttributeEvent(new AttributeRef(enrichedEvent.getId(), power_sts_4), Integer.valueOf(strings[3]));
//        event4.setSend(true);
//        sendAttributeEvent(event4);
        HdiEven hdiEven = new HdiEven(hdi254PowerDe);
        hdiEven.setAssetCode("publish");
        clientEventService.publishEvent(hdiEven);
        return true;
    }


    private boolean handle253DataUpdateCommandClient(EntityManager em, AttributeEvent enrichedEvent) {
        if (enrichedEvent.getValue().orElseThrow(() -> new IllegalArgumentException("Value null")) instanceof Hdi253Update value) {
            String[] phase_1 = value.getPhase_1().split("-", 4);//u1, i1, e1
            String[] phase_2 = value.getPhase_2().split("-", 4);//u2, i2 e2
            String[] phase_3 = value.getPhase_3().split("-", 4);//u3, i3, e3

            String[][] phases = {phase_1, phase_2, phase_3};
            int index = 1;
            for (String[] phase : phases) {
                String u = phase[0];
                String i = phase[1];
                String e = phase[2];
                String p = phase[3];

                AttributeEvent event1 = new AttributeEvent(new AttributeRef(enrichedEvent.getId(), U + "Phase" + index), u);
                event1.setSend(true);
                sendAttributeEvent(event1);

                AttributeEvent event2 = new AttributeEvent(new AttributeRef(enrichedEvent.getId(), I + "Phase" + index), i);
                event2.setSend(true);
                sendAttributeEvent(event2);

                AttributeEvent event3 = new AttributeEvent(new AttributeRef(enrichedEvent.getId(), E + "Phase" + index), e);
                event3.setSend(true);
                sendAttributeEvent(event3);

                AttributeEvent event4 = new AttributeEvent(new AttributeRef(enrichedEvent.getId(), P + "Phase" + index), p);
                event4.setSend(true);
                sendAttributeEvent(event4);
                index++;
            }

            HdiEven hdiEven = new HdiEven(value);
            hdiEven.setAssetCode("publish");
            clientEventService.publishEvent(hdiEven);

        }


        return true;
    }

    private boolean handle255SceneCommandClient(EntityManager em, AttributeEvent enrichedEvent) {
        if (enrichedEvent.getValue().orElseThrow(() -> new IllegalArgumentException("Value null")) instanceof Hdi255SceneDe value) {
//
//            ScheduleInfo schedule = (ScheduleInfo) em.createNativeQuery("select * from schedule_info WHERE schedule_code = ?", ScheduleInfo.class)
//                    .setParameter(1, value.getScene_id().toString()).getSingleResult();
//
//            EmailNotificationMessage emailMessage = new EmailNotificationMessage()
//                    .setFrom("")
//                    .setSubject("[HOMICO IOT Platform] Tủ điện " + enrichedEvent.getAssetName() + "(" + enrichedEvent.getAssetCode() + ") thông báo trạng thái bản tin kịch bản")
////                    .setHtml("");
//                    .setText(schedule.getScheduleName()+"-"+schedule.getScheduleCode()+"-"+value.getStatus());
//
////             Tạo Target kiểu USER
//            Notification.Target userTarget = new Notification.Target(Notification.TargetType.USER, schedule.getUpdateBy());
//
//            // Tạo Notification
//            Notification notification = new Notification()
//                    .setName("assetStatus")
//                    .setMessage(emailMessage)
//                    .setRepeatFrequency(RepeatFrequency.ALWAYS) // Hoặc dùng .setRepeatInterval("PT24H")
//                    ;
//            notification.setTargets(Collections.singletonList(userTarget));
//            notification.realm = schedule.getRealm();
//
//            notificationService.sendNotification(notification);

            if (value.getStatus() == 0) {
                RulesService.expiringList.remove(new RulesService.Command(value.getScene_id(),"cu"), command -> {
                });
                List<?> assetIds = scheduleInfoPersistenceService.getAssetIdByScheduleAsset(value.getScene_id());
                List<Asset<?>> assets = assetStorageService.findAll(new AssetQuery().ids(assetIds.toArray(String[]::new)));
                scheduleInfoPersistenceService.updateAssetStatusByScheduleAndAssetId(value.getScene_id(), 1, assets.stream().filter(asset -> Arrays.stream(asset.getPath()).toList().contains(enrichedEvent.getId())).map(Asset::getId).toList());
                scheduleInfoPersistenceService.updateAssetStatusByScheduleAndAssetId(value.getScene_id(),1, assets.stream().filter(asset ->asset.getId().equals(enrichedEvent.getPath()[0])).map(Asset::getId).toList());
            } else {
//                RulesService.expiringList.remove(new RulesService.Command(scheduleId));
            }

            LOG.log(System.Logger.Level.INFO, "logkichbantu" + enrichedEvent.getAssetCode() + "-" + value.getScene_id() + "-" + value.getStatus() + "-" + "Hdi255SceneDe");
            HdiEven hdiEven = new HdiEven(value);
            hdiEven.setAssetCode("publish");
            clientEventService.publishEvent(hdiEven);
            return true;
        } else {
            return false;
        }

    }

    private boolean handle255SceneClearCommandClient(EntityManager em, AttributeEvent enrichedEvent) {
        if (enrichedEvent.getValue().orElseThrow(() -> new IllegalArgumentException("Value null")) instanceof Hdi255SceneClearDe value) {
            if (value.getStatus() == 0) {
//                RulesService.expiringList.remove(new RulesService.Command(value.getScene_id(),"d"), command -> {
//                });
                List<?> assetIds = scheduleInfoPersistenceService.getAssetIdByScheduleAsset(value.getScene_id());
                List<Asset<?>> assets = assetStorageService.findAll(new AssetQuery().ids(assetIds.toArray(String[]::new)));
//                scheduleInfoPersistenceService.updateAssetStatusByScheduleAndAssetId(value.getScene_id(), 2, assets.stream().filter(asset -> Arrays.stream(asset.getPath()).toList().contains(enrichedEvent.getId())).map(Asset::getId).toList());
//                scheduleInfoPersistenceService.updateAssetStatusByScheduleAndAssetId(value.getScene_id(),2, assets.stream().filter(asset ->asset.getId().equals(enrichedEvent.getPath()[0])).map(Asset::getId).toList());
                scheduleInfoPersistenceService.removeScheduleAssets2(value.getScene_id(),  assets.stream().filter(asset -> Arrays.stream(asset.getPath()).toList().contains(enrichedEvent.getId())).map(Asset::getId).toList());
                scheduleInfoPersistenceService.removeScheduleAssets2(value.getScene_id(),  assets.stream().map(Asset::getId).filter(id -> id.equals(enrichedEvent.getPath()[0])).toList());
            }
//            else {
//                RulesService.expiringList.remove(new RulesService.Command(scheduleId));
//            }

            LOG.log(System.Logger.Level.INFO, "logxoakichbantu" + enrichedEvent.getAssetCode() + "-" + value.getScene_id() + "-" + value.getStatus() + "-" + "Hdi255SceneClearDe");
            HdiEven hdiEven = new HdiEven(value);
            hdiEven.setAssetCode("publish");
            clientEventService.publishEvent(hdiEven);
            return true;
        } else {
            return false;
        }

    }


    public boolean handle254DataDeCommandClient(EntityManager em, AttributeEvent enrichedEvent) {
        if (enrichedEvent.getValue().orElseThrow(() -> new IllegalArgumentException("Value null")) instanceof Hdi254StateDe) {
            String cabinetId = enrichedEvent.getId();
            Hdi254StateDe hdi254StateDe = (Hdi254StateDe) enrichedEvent.getValue().get();
            String nemas = hdi254StateDe.getLine_1().orElse("")
                    + hdi254StateDe.getLine_2().orElse("")
                    + hdi254StateDe.getLine_3().orElse("");
            List<LightCommand254State> lightCommands = new ArrayList<>();

            String[] arrayLightCommands = Arrays.stream(nemas.split(",")).map(String::trim).toArray(String[]::new);
            for (String arrayLightCommand : arrayLightCommands) {
                LightCommand254State lightCommand = new LightCommand254State();
                String[] item = arrayLightCommand.split("-");
                lightCommand.setCabinetAssetCode(item[0]);
                lightCommand.setBrightness(item[1]);
                lightCommand.setU(item[2]);
                lightCommand.setI(item[3]);
                lightCommand.setP(item[4]);
                lightCommand.setE(item[5]);
                lightCommand.setStatus(item[6]);
                lightCommands.add(lightCommand);
            }

            String[] cabinetAssetCodes = lightCommands.stream().map(LightCommand254State::getCabinetAssetCode).toArray(String[]::new);

            String sql1 = "select * from usr_sp_getAsset_info_list_by_parentId_2(:assetId, :array)";
            Query query = em.createNativeQuery(sql1, LightCommand254State.class);
            query.setParameter("assetId", cabinetId);
            query.setParameter("array", cabinetAssetCodes);
            List<LightCommand254State> result1s = query.getResultList();
            Map<String, LightCommand254State> lightCommandDataMap = result1s.stream()
                    .collect(Collectors.toMap(LightCommand254State::getCabinetAssetCode, lightCommand -> lightCommand));

            for (LightCommand254State lightCommand : lightCommands) {
                LightCommand254State ilc = lightCommandDataMap.get(lightCommand.getCabinetAssetCode());
                if (ilc != null) {
                    ilc.setBrightness(lightCommand.getBrightness());
                    ilc.setU(lightCommand.getU());
                    ilc.setI(lightCommand.getI());
                    ilc.setP(lightCommand.getP());
                    ilc.setE(lightCommand.getE());
                    ilc.setCosphi(String.valueOf
                            (
                                    Double.parseDouble(lightCommand.getP()) /
                                            (Double.parseDouble(lightCommand.getU()) * (Double.parseDouble(lightCommand.getI()) / 1000))
                            ));
                    ilc.setStatus(lightCommand.getStatus());
                }
            }

            for (LightCommand254State lightCommand : lightCommandDataMap.values()) {
                AttributeEvent event1 = new AttributeEvent(new AttributeRef(lightCommand.getId(), BRIGHTNESS), lightCommand.getBrightness());
                event1.setSend(true);
                sendAttributeEvent(event1);
                AttributeEvent event2 = new AttributeEvent(new AttributeRef(lightCommand.getId(), U), lightCommand.getU());
                sendAttributeEvent(event2);
                AttributeEvent event3 = new AttributeEvent(new AttributeRef(lightCommand.getId(), I), lightCommand.getI());
                sendAttributeEvent(event3);
                AttributeEvent event4 = new AttributeEvent(new AttributeRef(lightCommand.getId(), E), lightCommand.getE());
                sendAttributeEvent(event4);
                AttributeEvent event5 = new AttributeEvent(new AttributeRef(lightCommand.getId(), P), lightCommand.getP());
                sendAttributeEvent(event5);
                AttributeEvent event6 = new AttributeEvent(new AttributeRef(lightCommand.getId(), COSPHI), lightCommand.getCosphi());
                sendAttributeEvent(event6);

                if (lightCommand.getStatus().equals("1")) {
                    if (Integer.parseInt(lightCommand.getBrightness()) > 0) {
                        lightCommand.setStatus("A");
                        assetStorageService.updateStartAssetInfo(lightCommand.getId(), "A");
                    } else {
                        lightCommand.setStatus("I");
                        assetStorageService.updateStartAssetInfo(lightCommand.getId(), "I");
                    }
                } else {
                    lightCommand.setStatus("D");
                    assetStorageService.updateStartAssetInfo(lightCommand.getId(), "D");
                }

                AttributeEvent event7 = new AttributeEvent(true, new AttributeRef(lightCommand.getId(), STATUS), lightCommand.getStatus());
                sendAttributeEvent(event7);
            }

            HdiEven hdiEven = new HdiEven(hdi254StateDe);
            hdiEven.setAssetCode("publish");
            clientEventService.publishEvent(hdiEven);
            return true;
        }
        return false;
    }

    public boolean compareBigDecimal(String valueString, BigDecimal min, BigDecimal max) {
        BigDecimal value = new BigDecimal(valueString);
        return value.compareTo(min) >= 0 && value.compareTo(max) <= 0;
    }


    public static void setFieldValueIfMatch(Object obj, String fieldName, Object value) {
        Class<?> clazz = obj.getClass();
        try {
            Field field = clazz.getDeclaredField(fieldName); // Lấy field theo tên
            field.setAccessible(true); // Cho phép truy cập private fields
            field.set(obj, value); // Gán giá trị mới
        } catch (NoSuchFieldException e) {
            System.out.println("Trường không tồn tại: " + fieldName);
        } catch (IllegalAccessException e) {
            System.out.println("Không thể truy cập vào trường: " + fieldName);
        }
    }

    public boolean dimmingAllLightInCabinet(List<LightCommand3Control2> results, EntityManager em, AttributeEvent enrichedEvent) {
        try {
            String value = ValueUtil.asJSON(enrichedEvent.getValue().orElse(null)).orElse(ValueUtil.NULL_LITERAL);//giá trị điều chỉnh tủ đèn
//            for (String item: results.stream().map(LightCommand3Control2::getId).toList()) {
//                AttributeEvent attributeEvent=new AttributeEvent(new AttributeRef(item,AssetProcessingService.BRIGHTNESS),value);
//                attributeEvent.setSend(true);
//                sendAttributeEvent(attributeEvent);
//            }


            Hdi3ControlSe hdi3ControlSe = new Hdi3ControlSe(String.join(",", results.stream().map(l -> l.getCabinetAssetCode() + "-" + value).toList()));
            enrichedEvent.setValue(hdi3ControlSe);
            clientEventService.publishEvent(enrichedEvent);

//            Map<String, List<LightInfoCommandByParentId>> groupedResults=results.stream()
//                    .collect(Collectors.groupingBy(LightInfoCommandByParentId::getRouteGrpCode));
//            Hdi3ControlSe2 hdi3ControlSe2 = new Hdi3ControlSe2();
//            groupedResults.forEach((key, valueV) -> {
//                        setFieldValueIfMatch(
//                                hdi3ControlSe2,
//                                key,
//                                String.join(",", valueV.stream().map(l -> l.getCabinetAssetCode()+"-"+value).toList()));
//                    });
//            enrichedEvent.setValue(hdi3ControlSe2);
//            clientEventService.publishEvent(enrichedEvent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean dimmingAllGroupLight(List<LightCommand3Control2> results, EntityManager em, AttributeEvent enrichedEvent) {
        try {
            String value = ValueUtil.asJSON(enrichedEvent.getValue().orElse(null)).orElse(ValueUtil.NULL_LITERAL);//giá trị điều chỉnh tủ đèn
            for (String item : results.stream().map(LightCommand3Control2::getId).toList()) {
                AttributeEvent attributeEvent = new AttributeEvent(new AttributeRef(item, AssetProcessingService.BRIGHTNESS), value);
                attributeEvent.setSend(true);
                sendAttributeEvent(attributeEvent);
            }
            Map<String, List<LightCommand3Control2>> groupedResults = results.stream()
                    .collect(Collectors.groupingBy(LightCommand3Control2::getCabinetGrpCode));
            Hdi3ControlSe2 hdi3ControlSe2 = new Hdi3ControlSe2();
            groupedResults.forEach((key, valueV) -> {
                setFieldValueIfMatch(
                        hdi3ControlSe2,
                        key,
                        enrichedEvent.getValue().orElse(null));
            });
            enrichedEvent.setValue(hdi3ControlSe2);
            clientEventService.publishEvent(enrichedEvent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }


    public boolean dimmingLight(List<LightCommand3Control2> results, EntityManager em, AttributeEvent enrichedEvent) {
        try {
            String value = ValueUtil.asJSON(enrichedEvent.getValue().orElse(null)).orElse(ValueUtil.NULL_LITERAL);//giá trị điều chỉnh tủ đèn
            Hdi3ControlSe hdi3ControlSe = new Hdi3ControlSe(String.join(",", results.stream().map(l -> l.getCabinetAssetCode() + "-" + value).toList()));
            enrichedEvent.setValue(hdi3ControlSe);
            clientEventService.publishEvent(enrichedEvent);
//            Map<String, List<LightCommand3Control2>> groupedResults=results.stream()
//                    .collect(Collectors.groupingBy(LightCommand3Control2::getRouteGrpCode));
//            Hdi3ControlSe2 hdi3ControlSe2 = new Hdi3ControlSe2();
//            groupedResults.forEach((key, valueV) -> {
//                setFieldValueIfMatch(
//                        hdi3ControlSe2,
//                        key,
//                        String.join(",", valueV.stream().map(l -> l.getCabinetAssetCode()+"-"+value).toList()));
//            });
//            enrichedEvent.setValue(hdi3ControlSe2);
//            clientEventService.publishEvent(enrichedEvent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }


    public boolean dimmingLightGroup(List<LightCommand3Control2> results, EntityManager em, AttributeEvent enrichedEvent) {
        try {
//            Hdi3ControlSe hdi3ControlSe = new Hdi3ControlSe(String.join(",", results.stream().map(l -> l.getCabinetAssetCode() + "-" + value).toList()));
//            enrichedEvent.setValue(hdi3ControlSe);
//            clientEventService.publishEvent(enrichedEvent);
            Map<String, List<LightCommand3Control2>> groupedResults = results.stream()
                    .collect(Collectors.groupingBy(LightCommand3Control2::getCabinetGrpCode));
            Hdi3ControlSe2 hdi3ControlSe2 = new Hdi3ControlSe2();
            groupedResults.forEach((key, valueV) -> {
                setFieldValueIfMatch(
                        hdi3ControlSe2,
                        key,
                        enrichedEvent.getValue().orElse(null));
            });
            enrichedEvent.setValue(hdi3ControlSe2);
            clientEventService.publishEvent(enrichedEvent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" +
                '}';
    }

    protected int getEventProcessingRouteNumber(String assetId) {
        int charCode = Character.codePointAt(assetId, 0);
        return (charCode % eventProcessingThreadCount) + 1;
    }

    protected String getEventProcessingRouteURI(int routeNumber) {
        return EVENT_PROCESSOR_URI_PREFIX + routeNumber + EVENT_PROCESSOR_URI_SUFFIX;
    }
}
