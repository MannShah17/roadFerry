const { db, firebase } = require('../../config/admin');
const fetch = require('node-fetch');

const fetchDistanceBetweenPoints = async (lat1, lng1, lat2, lng2) => {
  const apiKey = 'AIzaSyCItzj5w3MbKo3zTyY0i4K6fPvbUYGNN-4';
  const urlToFetchDistance = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat1},${lng1}&destinations=${lat2}%2C${lng2}&key=${apiKey}`;
  console.log(`urlToFetchDistance(changes): ${urlToFetchDistance}`);
  
  try {
    const response = await fetch(urlToFetchDistance);
    const res = await response.json();
    
    console.log(`API Response: ${JSON.stringify(res)}`);
    
    if (res.status !== 'OK') {
      throw new Error(`API returned status: ${res.status}`);
    }
    
    if (!res.rows || !res.rows[0] || !res.rows[0].elements || !res.rows[0].elements[0]) {
      throw new Error('Unexpected API response format');
    }
    
    const tDistanceValue = res.rows[0].elements[0].distance.value;
    console.log(`tDistanceValue: ${tDistanceValue}`);
    
    const finalDistanceValue = (((tDistanceValue / 1000) * 10) / 10).toFixed(2);
    console.log(`finalDistanceValue: ${finalDistanceValue}`);
    
    return finalDistanceValue;
  } catch (error) {
    console.log('Problem occurred: ', error);
    throw error;
  }
};

const calculatePrice = (distanceValue, selectedVehicleTypeData) => {
  console.log(`selectedVehicleTypeData:`, selectedVehicleTypeData);
  if (selectedVehicleTypeData == undefined) {
    return;
  }
  console.log(`distance:`, distanceValue);
  console.log(`minimumRate:`, selectedVehicleTypeData.data.minimumRate);
  let minRate = 0;
  if (selectedVehicleTypeData.data.minimumRate != undefined) {
    minRate = selectedVehicleTypeData.data.minimumRate;
  }
  console.log(`selectedVehicleType:`, selectedVehicleTypeData.data.rates);
  let finalRate = parseFloat(minRate);
  console.log(`finalRate:`, finalRate);
  let differenceDistance = parseFloat(distanceValue);
  for (let i = 0; i < selectedVehicleTypeData.data.rates.length; i++) {
    let ratesData = selectedVehicleTypeData.data.rates[i];
    let start = parseFloat(ratesData.start);
    let end = parseFloat(ratesData.end);
    let rate = parseFloat(ratesData.rate);

    if (i == 0 && start == 0) {
      start = 1;
    }
    if (distanceValue >= start) {
      start = start - 1;
    }

    if (
      (end == -1 ||
        distanceValue <= end ||
        i == selectedVehicleTypeData.data.rates.length - 1) &&
      distanceValue >= start
    ) {
      console.log(`differenceOfStart:`, distanceValue - start);
      finalRate = finalRate + (distanceValue - start) * rate;
      break;
    } else if (differenceDistance >= start) {
      differenceDistance = differenceDistance - end;
      let differenceOfStartNEnd = end - start;
      console.log(`differenceOfStartNEnd:`, differenceOfStartNEnd);
      finalRate = finalRate + differenceOfStartNEnd * rate;
    }
    console.log(`finalRate:`, finalRate);
  }
  console.log(`finalRate:`, finalRate);
  return finalRate;
};

const calculatePriceDistance = async (req, res) => {
  const { lat1, lng1, lat2, lng2, selectedVehicleTypeData } = req.body;

  try {
    const distance = await fetchDistanceBetweenPoints(lat1, lng1, lat2, lng2);
    const price = calculatePrice(distance, selectedVehicleTypeData);
    res.json({ price });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { calculatePriceDistance };
