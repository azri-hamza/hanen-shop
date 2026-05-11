import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useCreateCustomer } from '../../hooks/useCustomers';

type FormData = {
  name: string;
  phone: string;
};

export function CustomerFormScreen() {
  const navigation = useNavigation();
  const createMutation = useCreateCustomer();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', phone: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({ name: data.name, phone: data.phone || undefined });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to create customer');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 }}>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Name *</Text>
              <TextInput style={inputStyle} value={value} onChangeText={onChange} placeholder="Customer name" />
              {errors.name && <Text style={{ color: '#f44336', fontSize: 12 }}>{errors.name.message}</Text>}
            </View>
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Phone (optional)</Text>
              <TextInput style={inputStyle} value={value} onChangeText={onChange} placeholder="Phone number" keyboardType="phone-pad" />
            </View>
          )}
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          style={{ backgroundColor: '#3f51b5', padding: 14, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Create</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
};
