package org.openremote.model.dto;

public class SearchFilterDTO<T> {
    private String keyWord;
    private Integer page;
    private Integer size;
    T data;

    public SearchFilterDTO() {
    }

    public SearchFilterDTO(String keyword, Integer page, Integer size, T data) {
        this.page = page;
        this.size = size;
        this.data = data;
    }

    public String getKeyWord() {
        return keyWord;
    }

    public void setKeyWord(String keyword) {
        this.keyWord = keyword;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
