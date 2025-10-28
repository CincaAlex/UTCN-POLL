package models;

public class ResultError {
    private boolean success;
    private String message;

    public ResultError(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }
}
