package org.openremote.model.blog;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import org.openremote.model.Constants;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name ="Blog")
@Path("blog")
public interface BlogResource {
    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getBlog")
    List<Blog> getBlog(SearchFilterDTO<Blog> filterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getBlogCategory")
    List<BlogCategory> getBlogCategory(SearchFilterDTO<BlogCategory> filterDTO);

    @POST
    @Path("createBlog")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    Blog createBlog(Blog data);

    @POST
    @Path("createBlogCategory")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    BlogCategory createBlogCategory(BlogCategory data);

    @POST
    @Path("updateBlog")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    Blog updateBlog(Blog data);

    @POST
    @Path("updateBlogCategory")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    BlogCategory updateBlogCategory(BlogCategory data);

    @POST
    @Path("countBlog")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Long countBlog(SearchFilterDTO<Blog> filterDTO);

    @POST
    @Path("countBlogCategory")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Long countBlogCategory(SearchFilterDTO<BlogCategory> filterDTO);

    @POST
    @Path("removeBlog")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    boolean removeBlog(Blog data);

    @POST
    @Path("removeBlogCategory")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    boolean removeBlogCategory(BlogCategory data);
}
