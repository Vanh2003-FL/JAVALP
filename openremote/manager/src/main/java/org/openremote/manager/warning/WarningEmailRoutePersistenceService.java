package org.openremote.manager.warning;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.district.DistrictException;
import org.openremote.model.district.DistrictExceptionMapper;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.dto.WarningEmailRouteDto;
import org.openremote.model.warning.WarningEmailRoute;

import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

public class WarningEmailRoutePersistenceService extends RouteBuilder implements ContainerService {
    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());
    public static final int PRIORITY = DEFAULT_PRIORITY;

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public int getPriority() {
        return PRIORITY;
    }

    @Override
    public void configure() throws Exception {
    }

    @Override
    public void init(Container container) throws Exception {
        this.persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new WarningEmailRouteResourceImpl(container.getService(TimerService.class), identityService, this)
        );
        managerWebService.addApiSingleton(new DistrictExceptionMapper());

    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public List<WarningEmailRouteDto> getEmailRouteByEmailConfigId(Long emailConfigId, SearchFilterDTO<WarningEmailRouteDto> searchFilterDTO) {
        StringBuilder sqlBase = new StringBuilder(
                "SELECT " +
                        "wer.id, wer.warning_email_id, wer.route_id, a.name AS route_name, wer.start_date, wer.active " +
                        "FROM warning_email_route wer " +
                        "LEFT JOIN asset a ON a.id = wer.route_id " +
                        "WHERE wer.warning_email_id = ? AND wer.active = true"
        );

        return persistenceService.doReturningTransaction(em -> {
            var results = em.createNativeQuery(sqlBase.toString(), WarningEmailRouteDto.class)
                    .setParameter(1, emailConfigId);
            if (validationUtils.isValid(searchFilterDTO.getSize()) || validationUtils.isValid(searchFilterDTO.getPage())) {
                results.setMaxResults(searchFilterDTO.getSize());
                results.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }


            return (List<WarningEmailRouteDto>) results.getResultList();
        });
    }

    public Long getCountEmailRouteByEmailConfigId(Long emailConfigId) {
        StringBuilder sqlBase = new StringBuilder(
                "SELECT " +
                        "count(wer.id) " +
                        "FROM warning_email_route wer " +
                        "LEFT JOIN asset a ON a.id = wer.route_id " +
                        "WHERE wer.warning_email_id = ? AND wer.active = true"
        );

        return persistenceService.doReturningTransaction(em -> {
            Long results = (Long) em.createNativeQuery(sqlBase.toString())
                    .setParameter(1, emailConfigId)
                    .getSingleResult();

            return results;
        });
    }

    public WarningEmailRouteDto createWarningRoute(WarningEmailRoute warningEmailRoute) {
        try {
            return persistenceService.doReturningTransaction(em -> {
                // Kiểm tra trùng mã hoặc tên nếu cần
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM warning_email_route WHERE LOWER(route_id) = LOWER(?) AND warning_email_id = ? AND active = true")
                        .setParameter(1, warningEmailRoute.getRouteId().trim())
                        .setParameter(2, warningEmailRoute.getWarningEmailId())
                        .getSingleResult();

                String routeName = (String) em.createNativeQuery(
                                "SELECT name FROM asset WHERE id = ? ")
                        .setParameter(1, warningEmailRoute.getRouteId().trim())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                            "Lộ tuyến'" + routeName + "' đã được cấu hình cho Email này!");
                }

                Long warningEmailRouteId = (Long) em.createNativeQuery(
                                "INSERT INTO warning_email_route (warning_email_id, route_id, start_date, active, create_date, create_by, update_date, update_by) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id")
                        .setParameter(1, warningEmailRoute.getWarningEmailId())
                        .setParameter(2, warningEmailRoute.getRouteId())
                        .setParameter(3, warningEmailRoute.getStartDate())
                        .setParameter(4, true) // active
                        .setParameter(5, new Date())
                        .setParameter(6, warningEmailRoute.getCreateBy())
                        .setParameter(7, new Date())
                        .setParameter(8, warningEmailRoute.getUpdateBy())
                        .getSingleResult();
                // Thiết lập giá trị mặc định
                warningEmailRoute.setId(warningEmailRouteId);
                warningEmailRoute.setActive(true);
                warningEmailRoute.setCreateDate(new Date());



                WarningEmailRouteDto routeDto = new WarningEmailRouteDto();
                routeDto.setId(warningEmailRouteId);
                routeDto.setWarningEmailId(warningEmailRoute.getWarningEmailId());
                routeDto.setRouteId(warningEmailRoute.getRouteId());
                routeDto.setRouteName(routeName);
                routeDto.setStartDate(warningEmailRoute.getStartDate());
                routeDto.setActive(warningEmailRoute.getActive());

                return routeDto;
            });
        } catch (DistrictException e) {
            throw e;
        } catch (Exception e) {
            LOG.severe("Lỗi khi tạo WarningEmailRoute: " + e.getMessage());
            throw new RuntimeException("Không thể tạo mới cấu hình email: ", e);
        }
    }


    public boolean deleteWarningRoute(Long warningRouteId) {
        try {
            return persistenceService.doReturningTransaction(em -> {

                // Xóa mềm: cập nhật deleted = 1
                int updated = em.createNativeQuery(
                                "UPDATE warning_email_route SET active = false WHERE id = ?")
                        .setParameter(1, warningRouteId)
                        .executeUpdate();

                return updated > 0;
            });
        } catch (Exception e) {
            LOG.severe("Lỗi khi xóa mềm WarningEmailRoute: " + e.getMessage());
            throw new RuntimeException("Không thể xóa WarningEmailRoute", e);
        }
    }


}
