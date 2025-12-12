package org.openremote.model.scheduleinfo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Converter(autoApply = true)
public class JsonToCustomizeLampTypeListConverter implements AttributeConverter<List<CustomizeLampType>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<CustomizeLampType> attribute) {
        try {
            Map<String, List<CustomizeLampType>> wrapper = new HashMap<>();
            wrapper.put("lamps", attribute);
            return mapper.writeValueAsString(wrapper);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting CustomizeLampType list to JSON", e);
        }
    }

    @Override
    public List<CustomizeLampType> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.isEmpty()) {
                return new ArrayList<>();
            }

            JsonNode node = mapper.readTree(dbData);

            if (node.has("lamps")) {
                return mapper.readValue(
                        node.get("lamps").toString(),
                        new TypeReference<List<CustomizeLampType>>() {}
                );
            } else if (node.isArray()) {
                return mapper.readValue(dbData, new TypeReference<List<CustomizeLampType>>() {});
            }

            return new ArrayList<>();
        } catch (Exception e) {
            throw new RuntimeException("Error converting JSON to CustomizeLampType list", e);
        }
    }
}
