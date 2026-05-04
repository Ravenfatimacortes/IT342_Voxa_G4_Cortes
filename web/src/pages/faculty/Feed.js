import React, { useState, useEffect } from 'react';
import FacultyPostFeed from '../../components/Posts/FacultyPostFeed';

const FacultyFeed = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Faculty Feed</h1>
        <p className="text-gray-300 mt-1">Share updates, announcements, and engage with the community</p>
      </div>
      
      <FacultyPostFeed />
    </div>
  );
};

export default FacultyFeed;
