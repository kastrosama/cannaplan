import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useFonts } from 'expo-font';

const { width: screenWidth } = Dimensions.get('window');
const dynamicFontSize = Math.min(Math.round(screenWidth * 0.11), 42);

export default function CreateGrowScreen({ navigation, nutrientBrand: presetBrand }) {
  const [strain, setStrain] = useState('');
  const [seedBank, setSeedBank] = useState('');
  const [type, setType] = useState('');
  const [vegWeeks, setVegWeeks] = useState('');
  const [startDate, setStartDate] = useState('');
  const [nutrients, setNutrients] = useState(presetBrand || '');
  const [dutchProSubtype, setDutchProSubtype] = useState('');
  const [soilType, setSoilType] = useState('');
  const [advancedNutrientsMedium, setAdvancedNutrientsMedium] = useState('');
  const [advancedNutrientsLine, setAdvancedNutrientsLine] = useState('');
  const [waterAmount, setWaterAmount] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'LemonMilk': require('../assets/fonts/LEMONMILK-Medium.otf'),
    'LemonMilkLight': require('../assets/fonts/LEMONMILK-Light.otf'),
  });

  const isAuto = type === 'Autoflower';

  const handleSaveAndGo = async () => {
    if (
      !strain.trim() ||
      !seedBank.trim() ||
      !type || type === '-- Select Type --' ||
      (!isAuto && (!vegWeeks || vegWeeks === '-- Select Duration --')) ||
      (isAuto && (!vegWeeks || vegWeeks === '-- Select Duration --')) ||
      !startDate ||
      !nutrients || nutrients === '-- Select Nutrients --' ||
      (nutrients === 'DutchPro' && (!dutchProSubtype || dutchProSubtype === '-- Select Type --')) ||
      (nutrients === 'BioBizz' && (!soilType || soilType === '-- Select Soil Type --')) ||
      (nutrients === 'AdvancedNutrients' && (!advancedNutrientsMedium || advancedNutrientsMedium === '-- Select Growing Medium --')) ||
      (nutrients === 'AdvancedNutrients' && (!advancedNutrientsLine || advancedNutrientsLine === '-- Select Nutrient Line --')) ||
      !waterAmount.trim()
    ) {
      alert('Please fill in all fields before generating a schedule.');
      return;
    }

    const data = {
      strain,
      seedBank,
      type,
      vegWeeks,
      startDate,
      nutrients,
      dutchProSubtype,
      soilType,
      advancedNutrientsSubtype: advancedNutrientsMedium,
      advancedNutrientsLine,
      waterAmount,
    };

    try {
      const datePart = moment(startDate).format('YYYY-MM-DD');
      const strainPart = strain.trim().split(' ')[0] || 'Grow';
      const filename = `grow_${strainPart}_${datePart}`;

      await AsyncStorage.setItem('grow_current', JSON.stringify(data));
      await AsyncStorage.setItem(filename, JSON.stringify(data));

      navigation.navigate('Feeding Schedule');
    } catch (e) {
      console.error('Failed to save grow data', e);
    }
  };

  if (!fontsLoaded) return null;

  const nutrientLineOptions = {
    'Soil – Organic': ['OG Organics (Iguana Juice)'],
    'Soil – Light Mix': ['pH Perfect Sensi Grow/Bloom', 'pH Perfect Grow Micro Bloom'],
    'Coco Coir': ['pH Perfect Sensi Coco Grow/Bloom', 'pH Perfect Connoisseur Coco Grow/Bloom', 'pH Perfect Grow Micro Bloom'],
    'Hydroponics': ['pH Perfect Sensi Grow/Bloom', 'pH Perfect Connoisseur Grow/Bloom', 'pH Perfect Grow Micro Bloom'],
    'Outdoor': ['Jungle Juice'],
  };

  const pickerStyle = Platform.OS === 'android' ? { color: '#000', backgroundColor: '#fff' } : {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { fontSize: dynamicFontSize }]}>CANNAPLAN</Text>
      <Text style={styles.subtitle}>Create a Grow Plan</Text>

      <Text style={styles.label}>Strain Name</Text>
      <TextInput
        style={[styles.input]}
        placeholder="e.g. Runtz"
        placeholderTextColor="#666"
        value={strain}
        onChangeText={setStrain}
      />

      <Text style={styles.label}>Seed Bank</Text>
      <TextInput
        style={[styles.input]}
        placeholder="e.g. Ritual Genetics"
        placeholderTextColor="#666"
        value={seedBank}
        onChangeText={setSeedBank}
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.input}>
        <Picker selectedValue={type} onValueChange={setType} style={pickerStyle}>
          <Picker.Item label="-- Select Type --" value="" />
          <Picker.Item label="Regular" value="Regular" />
          <Picker.Item label="Feminized" value="Feminized" />
          <Picker.Item label="Autoflower" value="Autoflower" />
        </Picker>
      </View>

      {!isAuto && (
        <>
          <Text style={styles.label}>Vegetation Duration</Text>
          <View style={styles.input}>
            <Picker selectedValue={vegWeeks} onValueChange={setVegWeeks} style={pickerStyle}>
              <Picker.Item label="-- Select Duration --" value="" />
              {[...Array(7)].map((_, i) => (
                <Picker.Item key={i + 2} label={`${i + 2} weeks`} value={`${i + 2}`} />
              ))}
            </Picker>
          </View>
        </>
      )}

      {isAuto && (
        <>
          <Text style={styles.label}>Total Grow Duration</Text>
          <View style={styles.input}>
            <Picker selectedValue={vegWeeks} onValueChange={setVegWeeks} style={pickerStyle}>
              <Picker.Item label="-- Select Duration --" value="" />
              {[...Array(5)].map((_, i) => {
                const total = i + 8;
                return <Picker.Item key={total} label={`${total} weeks`} value={`${total}`} />;
              })}
            </Picker>
          </View>
        </>
      )}

      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={[styles.fakeButton, { alignItems: 'flex-start', paddingHorizontal: 10 }]}
      >
        <Text style={[styles.buttonText, { textAlign: 'left', width: '100%' }]}>
          {startDate ? moment(startDate).format('DD-MM-YYYY') : 'Select Date'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setStartDate(selectedDate.toISOString());
          }}
        />
      )}

      {!presetBrand && (
        <>
          <Text style={styles.label}>Nutrient Brand</Text>
          <View style={styles.input}>
            <Picker selectedValue={nutrients} onValueChange={setNutrients} style={pickerStyle}>
              <Picker.Item label="-- Select Nutrients --" value="" />
              <Picker.Item label="BioBizz" value="BioBizz" />
              <Picker.Item label="DutchPro" value="DutchPro" />
              <Picker.Item label="AdvancedNutrients" value="AdvancedNutrients" />
            </Picker>
          </View>
        </>
      )}

      {nutrients === 'DutchPro' && (
        <>
          <Text style={styles.label}>Dutch Pro Type</Text>
          <View style={styles.input}>
            <Picker selectedValue={dutchProSubtype} onValueChange={setDutchProSubtype} style={pickerStyle}>
              <Picker.Item label="-- Select Type --" value="" />
              <Picker.Item label="All-Mix - Hard Water" value="All-Mix - Hard Water" />
              <Picker.Item label="All-Mix - RO / Soft Water" value="All-Mix - RO / Soft Water" />
              <Picker.Item label="Light-Mix - Hard Water" value="Light-Mix - Hard Water" />
              <Picker.Item label="Light-Mix - RO / Soft Water" value="Light-Mix - RO / Soft Water" />
              <Picker.Item label="Hydro / Coco - Hard Water" value="Hydro / Coco - Hard Water" />
              <Picker.Item label="Hydro / Coco - RO / Soft Water" value="Hydro / Coco - RO / Soft Water" />
            </Picker>
          </View>
        </>
      )}

      {nutrients === 'BioBizz' && (
        <>
          <Text style={styles.label}>Soil Type</Text>
          <View style={styles.input}>
            <Picker selectedValue={soilType} onValueChange={setSoilType} style={pickerStyle}>
              <Picker.Item label="-- Select Soil Type --" value="" />
              <Picker.Item label="Light-Mix" value="Light-Mix" />
              <Picker.Item label="All-Mix" value="All-Mix" />
              <Picker.Item label="Coco" value="Coco" />
            </Picker>
          </View>
        </>
      )}

      {nutrients === 'AdvancedNutrients' && (
        <>
          <Text style={styles.label}>Growing Medium</Text>
          <View style={styles.input}>
            <Picker selectedValue={advancedNutrientsMedium} onValueChange={(value) => {
              setAdvancedNutrientsMedium(value);
              setAdvancedNutrientsLine('');
            }} style={pickerStyle}>
              <Picker.Item label="-- Select Growing Medium --" value="" />
              <Picker.Item label="Soil – Organic" value="Soil – Organic" />
              <Picker.Item label="Soil – Light Mix" value="Soil – Light Mix" />
              <Picker.Item label="Coco Coir" value="Coco Coir" />
              <Picker.Item label="Hydroponics" value="Hydroponics" />
              <Picker.Item label="Outdoor" value="Outdoor" />
            </Picker>
          </View>

          {advancedNutrientsMedium && (
            <>
              <Text style={styles.label}>Nutrient Line</Text>
              <View style={styles.input}>
                <Picker selectedValue={advancedNutrientsLine} onValueChange={setAdvancedNutrientsLine} style={pickerStyle}>
                  <Picker.Item label="-- Select Nutrient Line --" value="" />
                  {nutrientLineOptions[advancedNutrientsMedium].map((line, index) => (
                    <Picker.Item key={index} label={line} value={line} />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </>
      )}

      <Text style={styles.label}>Water Amount (L)</Text>
      <TextInput
        style={[styles.input]}
        placeholder="e.g. 10"
        placeholderTextColor="#666"
        value={waterAmount}
        onChangeText={setWaterAmount}
        keyboardType="numeric"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSaveAndGo} style={styles.fakeButton}>
          <Text style={styles.buttonText}>Generate Feeding Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.fakeButton}>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
    backgroundColor: '#a2cb95',
    flexGrow: 1,
  },
  title: {
    fontSize: dynamicFontSize,
    fontFamily: 'LemonMilk',
    textAlign: 'center',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'LemonMilkLight',
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
  },
  label: {
    marginTop: 15,
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#666',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#000',
  },
  buttonContainer: {
    marginTop: 30,
  },
  fakeButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
  },
  buttonSpacer: {
    height: 0,
  },
});
