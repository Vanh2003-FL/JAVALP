package org.openremote.model.sys;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "SysWarningRule")
@Path("sysWarningRule")
public interface SysWarningRuleResource {
    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public List<SysWarningRule> getAll(SearchFilterDTO<SysWarningRule> filter);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("countData")
    Long countData();
}
