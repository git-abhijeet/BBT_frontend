import React, { useEffect, useState, useCallback } from 'react';
import { getVideos } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function UserVideos() {
    const { userId } = useParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const navigate = useNavigate();

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await getVideos(userId);
            if (data.data && data.data.length > 0) {
                setVideos(data.data);
                setUserDetails(data.data[0].user);
            }
        } catch (err) {
            console.error(err);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        document.getElementById('videoPlayerPopup').showModal();
    };

    const handleCloseVideo = () => {
        const videoElement = document.querySelector('#videoPlayerPopup video');
        if (videoElement) {
            videoElement.pause();
        }
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
                    <div className="flex items-center">
                        {userDetails && (
                            <>
                                <img
                                    src={userDetails.imgUrl || 'https://dummyimage.com/50x50/000/fff&text=User'}
                                    alt={userDetails.firstName}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {userDetails.firstName} {userDetails.lastName}'s Videos
                                    </h2>
                                    <p className="text-gray-600">{userDetails.email}</p>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/listing')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Listing
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <div
                            key={video._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                            onClick={() => handleVideoClick(video)}
                        >
                            <div className="aspect-video">
                                <video
                                    src={video.videoUrl}
                                    className="w-full h-full object-cover"
                                    poster={video.thumbnailUrl}
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                                {video.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                                )}
                                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {video.views || 0} views
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        {video.likes || 0} likes
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {videos.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No videos available</h3>
                        <p className="mt-1 text-sm text-gray-500">This user hasn't uploaded any videos yet.</p>
                    </div>
                )}

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