package org.openremote.manager.area;

import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.area.Area;
import org.openremote.model.dto.SearchFilterDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;
import org.openremote.model.security.User;

public class AreaPersistenceService extends RouteBuilder implements ContainerService {

  private static final Logger LOG = Logger.getLogger(AreaPersistenceService.class.getName());

  protected PersistenceService persistenceService;
  protected ManagerIdentityService identityService;

  @Override
  public void init(Container container) throws Exception {
    persistenceService = container.getService(PersistenceService.class);
    identityService = container.getService(ManagerIdentityService.class);

    ManagerWebService managerWebService = container.getService(ManagerWebService.class);
    managerWebService.addApiSingleton(new AreaResourceImpl(
        container.getService(TimerService.class), identityService, persistenceService, this));
  }

  @Override
  public void start(Container container) throws Exception {
  }

  @Override
  public void stop(Container container) throws Exception {
  }

  @Override
  public void configure() throws Exception {
  }

  public Area createArea(Area area, User user) {
    return persistenceService.doReturningTransaction(em -> {

      String createdBy = (user != null && user.getId() != null) ? user.getId() : "admin";

      String realm = (user != null && user.getRealm() != null) ? user.getRealm() : "master";

      if (area.getId() == null || area.getId().isEmpty()) {
        area.setId(UUID.randomUUID().toString());
      }

      em.createNativeQuery(
              "INSERT INTO openremote.area " +
                  "(id, name, code, short_name, ward_id, realm_name, created_by, created_at, is_deleted) " +
                  "VALUES (?, ?, ?, ?, ?, ?, ?, now(), false)")
          .setParameter(1, area.getId())
          .setParameter(2, area.getName().trim())
          .setParameter(3, area.getCode())
          .setParameter(4, area.getShortName())
          .setParameter(5, area.getWardId())
          .setParameter(6, realm)
          .setParameter(7, createdBy)
          .executeUpdate();

      return area;
    });
  }

  public List<Area> getArea(SearchFilterDTO<Area> filterDTO, User user) {
    return persistenceService.doReturningTransaction(em -> {
      String realm = (user != null && user.getRealm() != null)
          ? user.getRealm()
          : "master";

      StringBuilder sql = new StringBuilder(
          "SELECT a.id, a.name, a.code, a.short_name, a.ward_id, a.realm_name " +
              "FROM openremote.area a " +
              "WHERE a.realm_name = :realm AND a.is_deleted = false"
      );

      if (validationUtils.isValid(filterDTO.getData())
          && validationUtils.isValid(filterDTO.getData().getName())) {
        sql.append(" AND LOWER(a.name) LIKE LOWER(:name)");
      }

      if (validationUtils.isValid(filterDTO.getData())
          && validationUtils.isValid(filterDTO.getData().getWardId())) {
        sql.append(" AND a.ward_id = :wardId");
      }

      sql.append(" ORDER BY a.created_at DESC");

      Query query = em.createNativeQuery(sql.toString(), Area.class);

      query.setParameter("realm", realm);

      if (validationUtils.isValid(filterDTO.getData())) {
        if (validationUtils.isValid(filterDTO.getData().getName())) {
          query.setParameter("name", "%" + filterDTO.getData().getName().trim() + "%");
        }
        if (validationUtils.isValid(filterDTO.getData().getWardId())) {
          query.setParameter("wardId", filterDTO.getData().getWardId());
        }
      }

      if (validationUtils.isValid(filterDTO.getSize())
          && validationUtils.isValid(filterDTO.getPage())) {
        query.setMaxResults(filterDTO.getSize());
        query.setFirstResult((filterDTO.getPage() - 1) * filterDTO.getSize());
      }

      return (List<Area>) query.getResultList();
    });
  }

  public Area getAreaById(String id, User user) {
    return persistenceService.doReturningTransaction(em -> {

      String realm = (user != null && user.getRealm() != null)
          ? user.getRealm()
          : "master";

      String checkSql = "SELECT a.is_deleted " +
          "FROM openremote.area a " +
          "WHERE a.id = :id " +
          "AND a.realm_name = :realm";

      List<Object> checkResults = em.createNativeQuery(checkSql)
          .setParameter("id", id)
          .setParameter("realm", realm)
          .getResultList();

      if (checkResults.isEmpty()) {
        throw new RuntimeException("Không tìm thấy khu vực với ID: " + id);
      }

      Boolean isDeleted = (Boolean) checkResults.get(0);
      if (isDeleted != null && isDeleted) {
        throw new RuntimeException("Khu vực với ID: " + id + " đã bị xóa");
      }

      String sql = "SELECT a.id, a.name, a.code, a.short_name, a.ward_id, a.realm_name " +
          "FROM openremote.area a " +
          "WHERE a.id = :id " +
          "AND a.realm_name = :realm " +
          "AND a.is_deleted = false";

      Query query = em.createNativeQuery(sql, Area.class);
      query.setParameter("id", id);
      query.setParameter("realm", realm);

      List<Area> results = (List<Area>) query.getResultList();

      if (results.isEmpty()) {
        throw new RuntimeException("Không tìm thấy khu vực với ID: " + id);
      }

      return results.get(0);
    });
  }

  public Area updateArea(Area area, User user) {
    return persistenceService.doReturningTransaction(em -> {

      String updatedBy = (user != null && user.getId() != null)
          ? user.getId()
          : "admin";

      String realm = (user != null && user.getRealm() != null)
          ? user.getRealm()
          : "master";

      em.createNativeQuery(
              "UPDATE openremote.area " +
                  "SET name = ?, " +
                  "    code = ?, " +
                  "    short_name = ?, " +
                  "    ward_id = ?, " +
                  "    updated_by = ?, " +
                  "    updated_at = now() " +
                  "WHERE id = ? " +
                  "AND realm_name = ? " +
                  "AND is_deleted = false")
          .setParameter(1, area.getName())
          .setParameter(2, area.getCode())
          .setParameter(3, area.getShortName())
          .setParameter(4, area.getWardId())
          .setParameter(5, updatedBy)
          .setParameter(6, area.getId())
          .setParameter(7, realm)
          .executeUpdate();

      return area;
    });
  }

  public Long countArea(SearchFilterDTO<Area> filterDTO, User user) {
    return persistenceService.doReturningTransaction(em -> {

      String realm = (user != null && user.getRealm() != null)
          ? user.getRealm()
          : "master";

      StringBuilder sql = new StringBuilder(
          "SELECT COUNT(*) FROM openremote.area " +
              "WHERE realm_name = :realm AND is_deleted = false"
      );

      if (validationUtils.isValid(filterDTO.getData())) {
        if (validationUtils.isValid(filterDTO.getData().getName())) {
          sql.append(" AND LOWER(name) LIKE LOWER(:name)");
        }
        if (validationUtils.isValid(filterDTO.getData().getWardId())) {
          sql.append(" AND ward_id = :wardId");
        }
      }

      Query query = em.createNativeQuery(sql.toString());
      query.setParameter("realm", realm);

      if (validationUtils.isValid(filterDTO.getData())) {
        if (validationUtils.isValid(filterDTO.getData().getName())) {
          query.setParameter(
              "name",
              "%" + filterDTO.getData().getName().trim() + "%"
          );
        }
        if (validationUtils.isValid(filterDTO.getData().getWardId())) {
          query.setParameter("wardId", filterDTO.getData().getWardId());
        }
      }

      return ((Number) query.getSingleResult()).longValue();
    });
  }

  public boolean deleteArea(String id, User user) {
    return persistenceService.doReturningTransaction(em -> {

      String updatedBy = (user != null && user.getId() != null)
          ? user.getId()
          : "admin";

      String realm = (user != null && user.getRealm() != null)
          ? user.getRealm()
          : "master";

      int updated = em.createNativeQuery(
              "UPDATE openremote.area " +
                  "SET is_deleted = true, " +
                  "    updated_by = :updatedBy, " +
                  "    updated_at = now() " +
                  "WHERE id = :id " +
                  "AND realm_name = :realm " +
                  "AND is_deleted = false")
          .setParameter("id", id)
          .setParameter("realm", realm)
          .setParameter("updatedBy", updatedBy)
          .executeUpdate();

      return updated > 0;
    });
  }
}
