package org.openremote.manager.rules;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

/**
 * Một cấu trúc dữ liệu giống List, nơi các phần tử sẽ tự động bị xóa sau một khoảng thời gian nhất định.
 * Lớp này an toàn để sử dụng trong môi trường đa luồng.
 *
 * @param <T> Kiểu dữ liệu của các phần tử trong list.
 */
public class ExpiringList<T> {

    //================================================================================
    // Các định nghĩa nội bộ (Enums, Interfaces, Classes)
    //================================================================================

    /**
     * Enum để xác định lý do một phần tử bị xóa.
     */
    public enum RemovalCause {
        /** Bị xóa do hết hạn (timeout). */
        EXPIRED,
        /** Bị xóa do người dùng gọi hàm remove(). */
        EXPLICIT;
    }

    /**
     * Một Functional Interface để định nghĩa hành động sẽ được thực thi khi một phần tử bị xóa.
     * Listener này sẽ nhận cả phần tử và lý do nó bị xóa.
     * @param <T> Kiểu của phần tử.
     */
    @FunctionalInterface
    public interface RemovalListener<T> {
        void onRemoval(T element, RemovalCause cause);
    }

    /**
     * Lớp nội bộ để bao bọc phần tử và lưu trữ thời gian hết hạn của nó.
     */
    private static class ExpiringEntry<T> {
        private final T element;
        private final long expiryTime;

        ExpiringEntry(T element, long expiryTime) {
            this.element = element;
            this.expiryTime = expiryTime;
        }

        T getElement() {
            return element;
        }

        boolean isExpired() {
            return System.currentTimeMillis() >= expiryTime;
        }
    }

    //================================================================================
    // Các thuộc tính của lớp
    //================================================================================

    private final ConcurrentLinkedDeque<ExpiringEntry<T>> entries = new ConcurrentLinkedDeque<>();
    private final long timeToLiveMillis;
    private final RemovalListener<T> removalListener; // Listener mặc định
    private final ScheduledExecutorService executorService;

    //================================================================================
    // Constructors
    //================================================================================

    /**
     * Khởi tạo List với thời gian sống của phần tử và một listener mặc định.
     * @param timeToLive Thời gian sống.
     * @param timeUnit   Đơn vị thời gian (giây, phút, v.v.).
     * @param listener   Hành động mặc định sẽ được gọi khi một phần tử bị xóa. Có thể là null.
     */
    public ExpiringList(long timeToLive, TimeUnit timeUnit, RemovalListener<T> listener) {
        this.timeToLiveMillis = timeUnit.toMillis(timeToLive);
        this.removalListener = listener;
        this.executorService = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r);
            thread.setDaemon(true); // Để không chặn chương trình kết thúc
            return thread;
        });
        // Lên lịch cho tác vụ dọn dẹp chạy định kỳ mỗi giây
        this.executorService.scheduleAtFixedRate(this::cleanup, 1, 1, TimeUnit.SECONDS);
    }

    /**
     * Khởi tạo List mà không có listener mặc định.
     */
    public ExpiringList(long timeToLive, TimeUnit timeUnit) {
        this(timeToLive, timeUnit, null);
    }

    //================================================================================
    // Các phương thức công khai (Public API)
    //================================================================================

    /**
     * Thêm một phần tử mới vào List.
     * @param element Phần tử cần thêm.
     */
    public void add(T element) {
        long expiryTime = System.currentTimeMillis() + timeToLiveMillis;
        entries.add(new ExpiringEntry<>(element, expiryTime));
    }

    /**
     * Xóa một phần tử và dùng listener mặc định đã được thiết lập.
     * @param element Phần tử cần xóa.
     * @return true nếu xóa thành công.
     */
    public boolean remove(T element) {
        return this.remove(element, null);
    }

    /**
     * Xóa một phần tử và cho phép truyền một hành động tùy chỉnh chỉ cho lần xóa này.
     *
     * @param element       Phần tử cần xóa.
     * @param oneTimeAction Hành động tùy chỉnh để thực thi. Nếu là null, sẽ dùng listener mặc định.
     * @return true nếu xóa thành công.
     */
    public boolean remove(T element, Consumer<T> oneTimeAction) {
        Iterator<ExpiringEntry<T>> iterator = entries.iterator();
        while (iterator.hasNext()) {
            ExpiringEntry<T> entry = iterator.next();
            if (Objects.equals(entry.getElement(), element)) {
                T removedElement = entry.getElement();
                // 1. Thực hiện xóa trước
                iterator.remove();

                // 2. Sau đó gọi hành động
                if (oneTimeAction != null) { // Ưu tiên hành động tùy chỉnh
                    oneTimeAction.accept(removedElement);
                } else if (removalListener != null) { // Nếu không thì dùng listener mặc định
                    removalListener.onRemoval(removedElement, RemovalCause.EXPLICIT);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Lấy về một bản sao dạng List của các phần tử chưa hết hạn.
     * @return Một List các phần tử.
     */
    public List<T> getElements() {
        return entries.stream()
                .filter(entry -> !entry.isExpired())
                .map(ExpiringEntry::getElement)
                .collect(Collectors.toList());
    }

    /**
     * Lấy kích thước hiện tại của List (chỉ đếm các phần tử chưa hết hạn).
     * @return số lượng phần tử.
     */
    public int size() {
        return getElements().size();
    }

    /**
     * Dừng tác vụ dọn dẹp nền. Cần được gọi khi không cần dùng List nữa để giải phóng tài nguyên.
     */
    public void shutdown() {
        executorService.shutdown();
    }

    //================================================================================
    // Các phương thức riêng tư (Private Helpers)
    //================================================================================

    /**
     * Tác vụ dọn dẹp, chạy ngầm để xóa các phần tử đã hết hạn.
     */
    private void cleanup() {
        Iterator<ExpiringEntry<T>> iterator = entries.iterator();
        while (iterator.hasNext()) {
            ExpiringEntry<T> entry = iterator.next();
            if (entry.isExpired()) {
                if (removalListener != null) {
                    removalListener.onRemoval(entry.getElement(), RemovalCause.EXPIRED);
                }
                iterator.remove();
            }
        }
    }

    //================================================================================
    // Ví dụ sử dụng
    //================================================================================
//    public static void main(String[] args) throws InterruptedException {
//        // 1. Định nghĩa listener mặc định
//        RemovalListener<String> defaultListener = (element, cause) -> {
//            System.out.println(
//                    "-> [Listener Mặc Định] Phần tử '" + element + "' đã bị xóa vì: " + cause
//            );
//        };
//
//        // 2. Khởi tạo list
//        ExpiringList<String> list = new ExpiringList<>(3, TimeUnit.SECONDS, defaultListener);
//        list.add("Item A (xóa tùy chỉnh)");
//        list.add("Item B (xóa mặc định)");
//        list.add("Item C (hết hạn)");
//        System.out.println("List ban đầu: " + list.getElements() + "\n");
//
//        // 3. Xóa với hành động TÙY CHỈNH
//        System.out.println("--- Xóa Item A với hành động TÙY CHỈNH ---");
//        list.remove("Item A (xóa tùy chỉnh)", removedItem -> {
//            System.out.println("✅ [Hành Động Tùy Chỉnh] Đã xóa '" + removedItem + "'.");
//        });
//        System.out.println("List hiện tại: " + list.getElements() + "\n");
//
//        // 4. Xóa với listener MẶC ĐỊNH
//        System.out.println("--- Xóa Item B, sẽ dùng listener MẶC ĐỊNH ---");
//        list.remove("Item B (xóa mặc định)");
//        System.out.println("List hiện tại: " + list.getElements() + "\n");
//
//        // 5. Chờ hết hạn (dùng listener MẶC ĐỊNH)
//        System.out.println("--- Chờ 4 giây để Item C hết hạn ---");
//        Thread.sleep(4000);
//        System.out.println("List cuối cùng: " + list.getElements());
//
//        // 6. Dọn dẹp
//        list.shutdown();
//    }
}