/*
 * Copyright 2016, OpenRemote Inc.
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
package org.openremote.manager.assetInfo;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.assetInfo.Asset_Info;
import org.openremote.model.assetInfo.AssetInfoResource;
import org.openremote.model.dto.ImportAssetDTO;
import org.openremote.model.dto.LightAssetDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.hdi.hdiDTO.routeAsset.RouterAssetCreate;
import org.openremote.model.http.RequestParams;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class AssetInfoResourceImpl extends ManagerWebResource implements AssetInfoResource {

    protected final AssetInfoPersistenceService assetInfoPersistenceService;

    public AssetInfoResourceImpl(TimerService timerService, ManagerIdentityService identityService, AssetInfoPersistenceService assetInfoPersistenceService) {
        super(timerService, identityService);
        this.assetInfoPersistenceService = assetInfoPersistenceService;
    }

    @Override
    public RouterAssetCreate get(RequestParams requestParams, String id) {
        return assetInfoPersistenceService.get(id);
    }

    @Override
    @Produces(MediaType.APPLICATION_JSON)
    public List<Asset_Info> getAll(RequestParams requestParams) {
//        return persistenceService.getAll();
        return null;
    }

    @Override
    public Response getStream(RequestParams requestParams, String path) throws IOException {
        if (path.startsWith("/upload")) {
            path = path.substring("/upload".length());  // Cắt bỏ "/upload"
        }
        String filename = path.substring(path.lastIndexOf("/") + 1);
        // Đường dẫn tới file cần tải
        java.nio.file.Path filePath = java.nio.file.Paths.get("/upload",path);
        // Kiểm tra file có tồn tại không
        if (!java.nio.file.Files.exists(filePath)) {
            // Nếu không tồn tại, trả về lỗi 404
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("File not found: " + filename)
                    .build();
        }
        // Đọc nội dung file thành mảng byte
        byte[] fileContent = java.nio.file.Files.readAllBytes(filePath);
        // Trả về file với header Content-Disposition để trình duyệt nhận đúng tên file khi tải v���
        return Response.ok(fileContent)
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .type("application/octet-stream")
                .build();
    }

    @Override
    public void create(RequestParams requestParams,Asset_Info assetInfo) {
        assetInfoPersistenceService.createAssetInfo(assetInfo);
//        Asset_Info info= assetInfoPersistenceService.create(assetInfo);
//        return info;
    }

    @Override
    public Asset_Info update(RequestParams requestParams, Long customerId, Asset_Info assetInfo) {
//        return persistenceService.update(customerId, name, email);
        return null;
    }

    @Override
    public void delete(RequestParams requestParams, Long customerId) {
//        persistenceService.delete(customerId);
    }

    @Override
    public LightAssetDTO getLightById(String assetId) {
        return assetInfoPersistenceService.getLightById(assetId);
    }

    @Override
    public List<LightAssetDTO> getAllLights(RequestParams requestParams, SearchFilterDTO<Asset_Info> filterDTO, String realm) {
        return assetInfoPersistenceService.getAllLights(filterDTO,realm);
    }

    @Override
    public Response importAssets(String realm, List<ImportAssetDTO> dtos) {
        try {
            assetInfoPersistenceService.importAssets(dtos, realm);
            return Response.ok("Import thành công").build();
        } catch (Exception e) {
            return Response.serverError().entity("Import thất bại: " + e.getMessage()).build();
        }
    }

    @Override
    public Response createLight(String realm, ImportAssetDTO dtos) {
        try {
            assetInfoPersistenceService.createLight(dtos, realm);
            return Response.ok("Import thành công").build();
        } catch (Exception e) {
            return Response.serverError().entity("Import thất bại: " + e.getMessage()).build();
        }
    }

    @Override
    public Response editLight(String assetId, String realm, ImportAssetDTO dto) {
        try {
            assetInfoPersistenceService.editLight(assetId, dto, realm);
            return Response.ok("Sửa thành công").build();
        } catch (Exception e) {
            return Response.serverError().entity("Sửa thất bại: " + e.getMessage()).build();
        }
    }

    @Override
    public Response deleteLight(String assetId) {
        boolean deleted = assetInfoPersistenceService.deleteLight(assetId); // Gọi service xóa
        if (deleted) {
            return Response.ok("Đã xóa đèn có ID: " + assetId).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Không tìm thấy đèn với ID: " + assetId)
                    .build();
        }
    }
}
