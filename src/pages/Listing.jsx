import React, { useEffect, useState } from 'react';
import { getVideos } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Listing() {
    const [groupedVideos, setGroupedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const { data } = await getVideos();

            // Group videos by user
            const videosByUser = {};
            data.data.forEach(video => {
                if (!videosByUser[video.user._id]) {
                    videosByUser[video.user._id] = {
                        user: video.user,
                        videos: []
                    };
                }
                videosByUser[video.user._id].videos.push(video);
            });

            setGroupedVideos(Object.values(videosByUser));
        } catch (err) {
            console.error(err);
            setGroupedVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        document.getElementById('videoPlayerPopup').showModal();
    };

    const handleCloseVideo = () => {
        // Get the video element and pause it
        const videoElement = document.querySelector('#videoPlayerPopup video');
        if (videoElement) {
            videoElement.pause();
        }
        // Close the popup and reset selected video
        document.getElementById('videoPlayerPopup').close();
        setSelectedVideo(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading videos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">All Videos</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Back to Home
                    </button>
                </div>

                <div className="space-y-8">
                    {groupedVideos.map((group) => (
                        <div key={group.user._id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <img
                                        src={group.user.imgUrl || 'https://via.placeholder.com/40'}
                                        alt={group.user.firstName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold">
                                            {group.user.firstName} {group.user.lastName}
                                        </h3>
                                        <p className="text-gray-600">{group.user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/user-videos/${group.user._id}`)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    View All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {group.videos.slice(0, 5).map((video) => (
                                    <div
                                        key={`${group.user._id}-${video._id}`}
                                        className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                                        onClick={() => handleVideoClick(video)}
                                    >
                                        <div className="aspect-video">
                                            <video
                                                src={video.videoUrl}
                                                className="w-full h-full object-cover"
                                                poster={video.thumbnailUrl}
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {video.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                {video.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Video Player Popup */}
                <dialog
                    id="videoPlayerPopup"
                    className="w-full max-w-4xl p-0 rounded-lg shadow-2xl backdrop:bg-black backdrop:opacity-50"
                    onClick={(e) => {
                        if (e.target.id === 'videoPlayerPopup') {
                            handleCloseVideo();
                        }
                    }}
                >
                    {selectedVideo && (
                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-800">{selectedVideo.title}</h3>
                                <button
                                    onClick={handleCloseVideo}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="aspect-video mb-4">
                                    <video
                                        src={selectedVideo.videoUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain bg-black"
                                    />
                                </div>
                                {selectedVideo.description && (
                                    <p className="text-gray-600 mt-2">{selectedVideo.description}</p>
                                )}
                                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {selectedVideo.views || 0} views
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        {selectedVideo.likes || 0} likes
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </dialog>
            </div>
        </div>
    );
}