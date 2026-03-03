import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const PropertyMap = ({ address, lat, lng }) => {
  const mapStyles = {
    height: "400px",
    width: "100%",
    borderRadius: "12px"
  };

  const defaultCenter = {
    lat: lat || 37.7749,
    lng: lng || -122.4194
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={15}
        center={defaultCenter}
      >
        <Marker position={defaultCenter} />
      </GoogleMap>
    </LoadScript>
  );
};

export default PropertyMap;