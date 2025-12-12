package org.openremote.manager.utils;

import java.util.Collection;

public class validationUtils {
    public static boolean isValid(String str) {
        return str != null && !str.trim().isEmpty();
    }

    public static boolean isValid(Integer num) {
        return num != null && num > 0;
    }

    public static boolean isValid(Long num) {
        return num != null && num > 0;
    }

    public static boolean isValid(Collection<?> collection) {
        return collection != null && !collection.isEmpty();
    }

    public static boolean isValid(Object obj) {
        return obj != null;
    }
}
