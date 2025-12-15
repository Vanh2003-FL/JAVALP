package org.openremote.model;

import java.lang.reflect.Field;

public class UpdateUtils {

    public static <T> void copyNonNullProperties(T source, T target) {
        Field[] fields = source.getClass().getDeclaredFields();
        for (Field field : fields) {
            try {
                field.setAccessible(true);
                Object value = field.get(source);
                if (value != null) {
                    field.set(target, value);
                }
            } catch (IllegalAccessException e) {
                // Handle exception
                e.printStackTrace();
            }
        }
    }

    public static <T> void copyUpdateProperties(T source, T target) {
        Field[] fields = source.getClass().getDeclaredFields();
        for (Field field : fields) {
            try {
                field.setAccessible(true);
                Object sourceValue = field.get(source);
                Object targetValue = field.get(target);

                // Chỉ sao chép nếu giá trị từ target là null
                if (sourceValue != null && targetValue == null) {
                    field.set(target, sourceValue);
                }
            } catch (IllegalAccessException e) {
                // Handle exception
                e.printStackTrace();
            }
        }
    }
}
