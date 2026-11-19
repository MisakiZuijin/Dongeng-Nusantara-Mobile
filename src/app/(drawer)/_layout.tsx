import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { CustomDrawerContent } from '@/components/CustomDrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerStyle: { width: 292 },
      }}
    >
      <Drawer.Screen name="home" options={{ title: 'Beranda Dongeng' }} />
      <Drawer.Screen name="bookshelf" options={{ title: 'Koleksi Rak Buku' }} />
      <Drawer.Screen name="bedtime-audio" options={{ title: 'Audio Tidur Nyenyak' }} />
      <Drawer.Screen name="favorites" options={{ title: 'Cerita Favorit' }} />
      <Drawer.Screen name="parent-settings" options={{ title: 'Pengaturan Orang Tua' }} />
    </Drawer>
  );
}
