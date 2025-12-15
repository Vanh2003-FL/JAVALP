package org.openremote.manager.itSupport;

import org.openremote.container.message.MessageBrokerService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.notification.NotificationService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.itSupport.Attachment;
import org.openremote.model.itSupport.ItSupport;
import org.openremote.model.itSupport.ItSupportLog;
import org.openremote.model.itSupport.ItSupportResource;
import org.openremote.model.notification.Notification;
import org.openremote.model.notification.PushNotificationMessage;
import org.openremote.model.notification.RepeatFrequency;
import org.openremote.model.security.User;
import org.openremote.model.Constants;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import static org.openremote.model.notification.Notification.Source.INTERNAL;

public class ItSupportResourceImpl extends ManagerWebResource implements ItSupportResource {
    protected final ItSupportPersistenceService itSupportPersistenceService;
    protected final MessageBrokerService messageBrokerService;
    private static final Logger LOG = Logger.getLogger(ItSupportResourceImpl.class.getName());



    public ItSupportResourceImpl(TimerService timerService, ManagerIdentityService identityService, ItSupportPersistenceService itSupportPersistenceService,MessageBrokerService messageBrokerService ) {
        super(timerService, identityService);
        this.itSupportPersistenceService = itSupportPersistenceService;
        this.messageBrokerService=messageBrokerService;
    }

    @Override
    public ItSupport create(ItSupport itSupport) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            user = new User();
        }

        User adminAssigner = identityService.getIdentityProvider().getUserByUsername(Constants.MASTER_REALM, Constants.MASTER_REALM_ADMIN_USER);

        itSupport = itSupportPersistenceService.createItSupport(itSupport, user, adminAssigner);

        List<Attachment> attachments = itSupportPersistenceService.createAttachments(itSupport, user);

        ItSupportLog log = itSupportPersistenceService.insertItSupportLog(itSupport, user, adminAssigner.getId());

        String sendByName = itSupportPersistenceService.getNameById(user.getId());

        itSupport.setSendBy(sendByName);

        sendNotification(itSupport, adminAssigner.getId());
        // notification

        return itSupport;
    }

    @Override
    public List<ItSupport> getAll(SearchFilterDTO<ItSupport> searchFilterDTO) {
        ItSupport itSupport = searchFilterDTO.getData();
        if (itSupport == null) {
            itSupport = new ItSupport();
        }
        if (!isSuperUser()) {
            String userId = getUserId();
            itSupport.setCreatedBy(userId);
            itSupport.setAssignedUser(userId);
        }
        return itSupportPersistenceService.getItSupport(itSupport, searchFilterDTO.getPage(), searchFilterDTO.getSize(), searchFilterDTO.getKeyWord());
    }

    @Override
    public ItSupport update(ItSupport itSupport) {
        // update assigner
        User user = identityService.getIdentityProvider().getUser(getUserId());

        boolean isUpdateAssignUser = false;
        if (isSuperUser() && itSupportPersistenceService.isUpdateAssignUser(itSupport)){
            itSupportPersistenceService.updateAssignUser(itSupport);
            isUpdateAssignUser = true;
        }

        itSupport = itSupportPersistenceService.createUpdateItSupport(itSupport, user);

        ItSupportLog log = itSupportPersistenceService.insertItSupportLog(itSupport, user, itSupport.getAssignedUser());

        String sendByName = itSupportPersistenceService.getNameById(user.getId());

        itSupport.setSendBy(sendByName);

        if (isUpdateAssignUser) {
            // notification
            sendNotification(itSupport, itSupport.getAssignedUser());
        }
        return itSupport;
    }

    @Override
    public ItSupport getAttachmentInSupport(String id) {
        ItSupport itSupport = itSupportPersistenceService.getItSupport(id);
        List<Attachment> attachments = itSupportPersistenceService.getAttachmentInSupport(id);
        itSupport.setAttachments(attachments);
        return itSupport;
    }

    public void sendNotification(ItSupport itSupport, String id){

        Map<String, Object> headers = new HashMap<>();
        headers.put(Notification.HEADER_SOURCE, INTERNAL);

        if (isAuthenticated()) {
            headers.put(Constants.AUTH_CONTEXT, getAuthContext());
        }

        PushNotificationMessage pushNotificationMessage = new PushNotificationMessage()
                .setTtlSeconds(60L*10)
                .setPriority(PushNotificationMessage.MessagePriority.HIGH)
                .setTargetType(PushNotificationMessage.TargetType.DEVICE)
                .setTitle("Yêu cầu hỗ trợ từ người dùng " + itSupport.getSendBy())
                .setBody("Yêu cầu hỗ trợ mới" )
                .setItSupportId(itSupport.getId());
        // Tạo Target kiểu USER
        Notification.Target userTarget = new Notification.Target(Notification.TargetType.USER, id);

        // Tạo Notification
        Notification notification = new Notification()
                .setName(null)
                .setMessage(pushNotificationMessage)
                .setRepeatFrequency(RepeatFrequency.ALWAYS) // Hoặc dùng .setRepeatInterval("PT24H")
                ;
        notification.setTargets(Collections.singletonList(userTarget));

        boolean success = messageBrokerService.getFluentProducerTemplate()
                .withBody(notification)
                .withHeaders(headers)
                .to(NotificationService.NOTIFICATION_QUEUE)
                .request(Boolean.class);

        if (!success) {
//            throw new WebApplicationException(BAD_REQUEST);
            LOG.warning("Send notification failed");

        }
//        return true;
    }

}
