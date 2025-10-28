package models;

import com.github.windpapi4j.InitializationFailedException;
import com.github.windpapi4j.WinAPICallFailedException;
import com.github.windpapi4j.WinDPAPI;
import com.github.windpapi4j.WinDPAPI.CryptProtectFlag;

import java.util.Base64;

import static java.nio.charset.StandardCharsets.UTF_8;

public class User {

    private static WinDPAPI winDPAPI;

    static {
        try {
            winDPAPI = WinDPAPI.newInstance(CryptProtectFlag.CRYPTPROTECT_UI_FORBIDDEN);
        } catch (InitializationFailedException e) {
            throw new RuntimeException(e);
        }
    }

    private int id;
    private String name;
    private String email;
    private byte[] password;

    public User(int id, String name, String email, String password) throws WinAPICallFailedException {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = winDPAPI.protectData(password.getBytes(UTF_8));;

    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public byte[] getPassword() {
        return password;
    }

    public void setPassword(byte[] password) {
        this.password = password;
    }



}
