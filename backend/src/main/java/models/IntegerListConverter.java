package models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Converter(autoApply = true)
public class IntegerListConverter implements AttributeConverter<List<Integer>, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Integer> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            return attribute.toString().replace("[", "").replace("]", "").replace(" ", "");
        }
    }

    @Override
    public List<Integer> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty() || dbData.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            if (dbData.startsWith("[")) {
                return objectMapper.readValue(dbData, new TypeReference<List<Integer>>() {});
            } else {
                List<Integer> result = new ArrayList<>();
                String[] parts = dbData.split(",");
                for (String part : parts) {
                    if (!part.trim().isEmpty()) {
                        result.add(Integer.parseInt(part.trim()));
                    }
                }
                return result;
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Error converting string to integer list: " + dbData, e);
        }
    }
}