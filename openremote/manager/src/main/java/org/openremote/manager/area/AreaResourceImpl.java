package org.openremote.manager.area;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.area.Area;
import org.openremote.model.area.AreaResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;

import java.util.List;

public class AreaResourceImpl extends ManagerWebResource implements AreaResource {

  protected final PersistenceService persistenceService;
  protected final AreaPersistenceService areaPersistenceService;

  public AreaResourceImpl(
      TimerService timerService,
      ManagerIdentityService identityService,
      PersistenceService persistenceService,
      AreaPersistenceService areaPersistenceService
  ) {
    super(timerService, identityService);
    this.persistenceService = persistenceService;
    this.areaPersistenceService = areaPersistenceService;
  }

  private User getCurrentUser() {
    return identityService
        .getIdentityProvider()
        .getUser(getUserId());
  }

  @Override
  public List<Area> getArea(SearchFilterDTO<Area> filterDTO) {
    return areaPersistenceService.getArea(
        filterDTO == null ? new SearchFilterDTO<>() : filterDTO,
        getCurrentUser()
    );
  }

  @Override
  public Area getAreaById(Area data) {
    if (data == null || data.getId() == null || data.getId().isEmpty()) {
      throw new RuntimeException("ID khu vực không hợp lệ!");
    }

    try {
      return areaPersistenceService.getAreaById(
          data.getId(),
          getCurrentUser()
      );
    } catch (RuntimeException e) {
      throw e;
    }
  }

  @Override
  public Area createArea(Area data) {
    return areaPersistenceService.createArea(
        data,
        getCurrentUser()
    );
  }

  @Override
  public Area updateArea(Area data) {
    return areaPersistenceService.updateArea(
        data,
        getCurrentUser()
    );
  }

  @Override
  public Long countArea(SearchFilterDTO<Area> filterDTO) {
    return areaPersistenceService.countArea(
        filterDTO == null ? new SearchFilterDTO<>() : filterDTO,
        getCurrentUser()
    );
  }

  @Override
  public boolean deleteArea(Area data) {
    if (data == null || data.getId() == null || data.getId().isEmpty()) {
      throw new RuntimeException("ID khu vực không hợp lệ!");
    }

    return areaPersistenceService.deleteArea(
        data.getId(),
        getCurrentUser()
    );
  }
}
