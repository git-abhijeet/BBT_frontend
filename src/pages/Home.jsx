import React, { useEffect, useState } from 'react';
import { updateProfile, getVideos, uploadVideo } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [user, setUser] = useState(null);
    const [bioPopup, setBioPopup] = useState(false);
    const [bio, setBio] = useState('');
    const [videos, setVideos] = useState([]);
    const [vidFile, setVidFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [hover, setHover] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingBio, setIsSavingBio] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("🚀 ~ useEffect ~ parsedUser:", parsedUser)
                setUser(parsedUser);
                fetchVideos(parsedUser.userName);
            } catch (error) {
                console.error("Error parsing user data from sessionStorage:", error);
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            resetVideoFields();
        };
    }, []);

    const fetchVideos = async (userId) => {
        try {
            const response = await getVideos(userId);
            console.log("🚀 ~ fetchVideos ~ response:", response);
            const videoData = response.data.data;
            setVideos(Array.isArray(videoData) ? videoData : []);
        } catch (err) {
            console.error(err);
            setVideos([]);
        }
    };

    const handlePicUpload = async (file) => {
        console.log("🚀 ~ handlePicUpload ~ file:", file)
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const formData = new FormData();
        formData.append('img', file);

        setIsUploading(true);

        try {
            const response = await updateProfile(user._id, formData);
            console.log("Profile update response:", response);
            console.log("Profile update response data:", response.data);

            if (response.data && response.data.user.imgUrl) {
                const updatedUser = { ...user, imgUrl: response.data.user.imgUrl };
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                alert('Profile picture updated successfully');
            }
        } catch (err) {
            console.error("Profile update error:", err);
            alert(err.response.data.message || 'Failed to update profile picture');
        } finally {
            setIsUploading(false);
        }
    };

    const saveBio = async () => {
        const formData = new FormData();
        formData.append('bio', bio);
        setIsSavingBio(true);
        try {
            const response = await updateProfile(user._id, formData);
            console.log("🚀 ~ saveBio ~ response:", response)
            console.log("🚀 ~ saveBio ~ response data:", response.data)
            if (response.data && response.data.user.bio) {
                const updatedUser = { ...user, bio: response.data.user.bio };
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                alert('Bio saved');
            }
            setBioPopup(false);
        } catch (err) {
            console.log("🚀 ~ saveBio ~ err:", err)
            alert(err.response.data.message);
        } finally {
            setIsSavingBio(false);
        }
    };

    const resetVideoFields = () => {
        setVidFile(null);
        setTitle('');
        setDescription('');
        const fileInput = document.querySelector('input[type="file"][accept="video/*"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleCloseVideoPopup = () => {
        document.getElementById('videoPopup').close();
        resetVideoFields();
    };

    const uploadNewVideo = async () => {
        if (!vidFile || vidFile.type !== 'video/mp4') {
            alert('Please select a valid MP4 video file');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('video', vidFile);
            formData.append('title', title);
            formData.append('description', description);
            await uploadVideo(user._id, formData);
            alert('Video uploaded successfully');
            handleCloseVideoPopup();
            fetchVideos(user.userName);
        } catch (err) {
            console.log("🚀 ~ uploadNewVideo ~ err:", err);
            console.error(err);
            alert(err.response.data.message || 'Failed to upload video');
            resetVideoFields();
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.href = '/login';
    };

    if (!user) return null;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md relative">
                <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200">
                    Logout
                </button>
                <div className="flex items-start mb-6">
                    <div className="relative flex-shrink-0">
                        <img
                            src={user.imgUrl || 'https://dummyimage.com/150x150/000/fff&text=Dummy+User'}
                            alt="Profile"
                            className="w-64 h-64 border border-gray-200 rounded-full object-cover shadow-lg"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="profilePicInput"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    handlePicUpload(file);
                                }
                            }}
                        />
                        <label
                            htmlFor="profilePicInput"
                            className={`absolute inset-0 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 ${hover ? 'bg-black bg-opacity-50 backdrop-blur-sm' : 'bg-transparent'
                                }`}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-white text-sm mt-2">Uploading...</span>
                                </div>
                            ) : hover && (
                                <div className="transform transition-transform duration-300 hover:scale-110">
                                    <span className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                                        Upload Pic
                                    </span>
                                </div>
                            )}
                        </label>
                    </div>
                    <div className="ml-4 flex-grow">
                        <h1 className="text-3xl font-bold mb-2">{user.firstName} {user.lastName}</h1>
                        <div className="space-y-2">
                            <p className="text-lg text-gray-600">
                                <span className="font-semibold">Email:</span> {user.email}
                            </p>
                            <p className="text-lg text-gray-600">
                                <span className="font-semibold">Mobile:</span> {user.mobileNum}
                            </p>
                            <div className="mt-4">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bio</h3>
                                {user.bio && user.bio.trim() ? (
                                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm max-w-full"> {/* Added max-w-full */}
                                        <p className="text-gray-700 whitespace-pre-wrap break-words"> {/* Added break-words */}
                                            {user.bio}
                                        </p>
                                        <button
                                            onClick={() => setBioPopup(true)}
                                            className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                                        >
                                            Edit Bio
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setBioPopup(true)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <span className="mr-2">✏️</span> Add Bio
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {bioPopup && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                            onClick={() => setBioPopup(false)}
                        ></div>
                        <div className="bg-white w-96 p-8 rounded-xl shadow-2xl transform transition-all duration-300 scale-100 relative z-10">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Update Bio</h3>
                            <textarea
                                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition duration-200"
                                placeholder="Write something about yourself..."
                                onChange={(e) => setBio(e.target.value)}
                                disabled={isSavingBio}
                            />
                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setBioPopup(false)}
                                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
                                    disabled={isSavingBio}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveBio}
                                    className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 relative"
                                    disabled={isSavingBio}
                                >
                                    {isSavingBio ? (
                                        <>
                                            <span className="opacity-0">Save Changes</span>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="mb-6 flex space-x-4">
                    <button onClick={() => document.getElementById('videoPopup').showModal()} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200">
                        Upload Video
                    </button>
                    <button onClick={() => navigate('/listing')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200">
                        View All Videos
                    </button>
                </div>
                <dialog
                    id="videoPopup"
                    className="w-full max-w-xl p-0 rounded-lg shadow-2xl backdrop:bg-black backdrop:opacity-50"
                    onClick={(e) => {
                        if (e.target.id === 'videoPopup') {
                            handleCloseVideoPopup();
                        }
                    }}
                >
                    <div className="bg-white rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-800">Upload New Video</h3>
                                <button
                                    onClick={handleCloseVideoPopup}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    placeholder="Enter video title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    placeholder="Enter video description"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none h-32"
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Upload a video</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (file.type === 'video/mp4') {
                                                                setVidFile(file);
                                                                e.target.value = ''; // Reset file input after selection
                                                            } else {
                                                                alert('Please select an MP4 video file only');
                                                                e.target.value = ''; // Clear invalid selection
                                                            }
                                                        }
                                                    }}
                                                    accept="video/mp4" // Restrict file picker to MP4 files
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">MP4 files only, up to 6MB</p>
                                    </div>
                                </div>
                                {vidFile && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Selected file: {vidFile.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseVideoPopup}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={uploadNewVideo}
                                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    disabled={uploading || !vidFile || !title.trim()}
                                >
                                    {uploading ? (
                                        <>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Uploading video...</span>
                                            </div>
                                        </>
                                    ) : (
                                        'Upload Video'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-lg font-medium text-gray-800">Uploading your video...</p>
                                <p className="text-sm text-gray-600">Please wait, this may take a moment</p>
                            </div>
                        </div>
                    )}
                </dialog>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        My Videos
                    </h2>
                    {videos.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {videos.map((video) => (
                                <div key={video._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-gray-800">{video.title}</h3>
                                            <span className="text-sm text-gray-500">
                                                {new Date(video.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {video.description && (
                                            <p className="text-gray-600 mb-4">{video.description}</p>
                                        )}
                                        {video.videoUrl && (
                                            <div className="relative rounded-lg overflow-hidden bg-gray-100">
                                                <video
                                                    src={video.videoUrl}
                                                    controls
                                                    className="w-full aspect-video object-cover"
                                                    preload="metadata"
                                                    poster={video.thumbnailUrl}
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                                                    <div className="h-full bg-blue-500 w-0" id={`progress-${video._id}`}></div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                                            <button className="text-gray-500 hover:text-gray-700">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first video.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => document.getElementById('videoPopup').showModal()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Upload Video
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}