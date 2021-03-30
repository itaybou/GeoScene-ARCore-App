package com.geoscene;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.geoscene.MainActivity;

import io.realm.Realm;

public class LoadingActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);


//        Realm realm = Realm.getDefaultInstance();
//        Log.i("Realm", realm.getPath());
        finish();
    }
}