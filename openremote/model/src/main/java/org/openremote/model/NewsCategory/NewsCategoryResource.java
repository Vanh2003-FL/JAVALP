package org.openremote.model.NewsCategory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

@Tag(name = "NewsCategory")
@Path("news-category")
public interface NewsCategoryResource {
    @POST
    @Path("get")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    List<NewsCategory> getNewsCategory(SearchFilterDTO<NewsCategory> filterDTO);

    @POST
    @Path("get-by-id")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    NewsCategory getNewsCategoryById(NewsCategory data);


    @POST
    @Path("create")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    NewsCategory createNewsCategory(NewsCategory data);

    @POST
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    NewsCategory updateNewsCategory(NewsCategory data);

    @POST
    @Path("count")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Long countNewsCategory(SearchFilterDTO<NewsCategory> filterDTO);

    @POST
    @Path("remove")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    boolean removeNewsCategory(NewsCategory data);
}
