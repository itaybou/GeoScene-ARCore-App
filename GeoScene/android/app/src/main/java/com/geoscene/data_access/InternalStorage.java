package com.geoscene.data_access;

import android.content.Context;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

public class InternalStorage {

    @SuppressWarnings("unchecked")
    public static <T> T read(Context context, String fileName) {
        try (FileInputStream fis = context.openFileInput(fileName)){
            ObjectInputStream is = new ObjectInputStream(fis);
            return (T) is.readObject();
        } catch (ClassNotFoundException | IOException fileNotFound) {
            return null;
        }
    }

    public static boolean delete(Context context, String fileName) {
        return context.deleteFile(fileName);
    }

    public static <T> boolean store(Context context, String fileName, T object){
        try (FileOutputStream fos = context.openFileOutput(fileName, Context.MODE_PRIVATE)){
            if (object != null) {
                ObjectOutputStream os = new ObjectOutputStream(fos);
                os.writeObject(object);
                return true;
            }
            return false;
        } catch (IOException fileNotFound) {
            return false;
        }
    }
}
