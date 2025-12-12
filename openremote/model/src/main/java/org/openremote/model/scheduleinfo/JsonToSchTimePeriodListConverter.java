package org.openremote.model.scheduleinfo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;


import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Converter
public class JsonToSchTimePeriodListConverter implements AttributeConverter<List<SchTimePeriod>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    static {
        // Đăng ký module xử lý Java 8 Time API
        mapper.registerModule(new JavaTimeModule());
    }

    @Override
    public String convertToDatabaseColumn(List<SchTimePeriod> attribute) {
        try {
            return mapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert SchTimePeriod list to JSON", e);
        }
    }

    @Override
    public List<SchTimePeriod> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.trim().isEmpty()) {
                return new ArrayList<>();
            }

            JsonNode rootNode = mapper.readTree(dbData);

            // Kiểm tra nếu là mảng trực tiếp
            if (rootNode.isArray()) {
                return mapper.readValue(dbData, new TypeReference<List<SchTimePeriod>>() {});
            }
            // Kiểm tra nếu là đối tượng chứa mảng "periods"
            else if (rootNode.has("periods") && rootNode.get("periods").isArray()) {
                return mapper.readValue(rootNode.get("periods").toString(), new TypeReference<List<SchTimePeriod>>() {});
            }
            // Kiểm tra nếu là đối tượng duy nhất
            else if (rootNode.isObject()) {
                SchTimePeriod period = mapper.treeToValue(rootNode, SchTimePeriod.class);
                List<SchTimePeriod> result = new ArrayList<>();
                result.add(period);
                return result;
            }

            throw new IllegalArgumentException("Unsupported JSON format: " + dbData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert JSON to SchTimePeriod list", e);
        }
    }

}
