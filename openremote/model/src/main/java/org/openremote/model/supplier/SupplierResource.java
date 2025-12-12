package org.openremote.model.supplier;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.http.RequestParams;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Supplier")
@Path("supplier")
public interface SupplierResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    List<Supplier> getAll(SearchFilterDTO<Supplier> filterDTO);

    @POST
    @Path("createSupplier")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Supplier createSupplier(Supplier supplier);

    @POST
    @Path("updateSupplier")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Supplier update(Supplier supplier);

    @POST
    @Path("countData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Long countData(SearchFilterDTO<Supplier> filterDTO);

    @POST
    @Path("remove")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    boolean remove(Supplier supplier);
}
