import React from 'react';

const VideoBackground = ({ videoSrc, isPlaying }) => {
  if (!isPlaying) {
    return (
      <div className="fixed inset-0 w-full h-full z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />
    );
  }

  return (
    <video
      autoPlay
      loop
      muted
      className="fixed inset-0 w-full h-full object-cover z-0"
      src={videoSrc}
    />
  );
};

export default VideoBackground;