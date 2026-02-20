import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, Save, Key, Camera } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'

export default function ProfilePage() {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        email: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || ''
            })
        }
    }, [user])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploadingAvatar(true)
        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
            await axios.post('/api/v1/users/me/avatar', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            // Quick reload to show new picture (a proper impl would refresh AuthContext)
            window.location.reload()
        } catch (error) {
            console.error('Failed to upload avatar', error)
            alert('Failed to upload profile photo.')
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    const handleSave = async () => {
        // Mock save function since we might not have a PUT /auth/me yet
        // If we do, we can call it here. For now just toggle state and pretend.
        setIsEditing(false)
        alert('Profile updated (mocked backend save)')
    }

    if (!user) return <div className="p-8 pt-32 text-center text-gray-500">Loading...</div>

    return (
        <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-background pt-24 px-4 md:px-8">
            <div className="w-full max-w-4xl mx-auto py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">User Profile</h1>
                    <p className="text-gray-400 mt-2">Manage your account settings and preferences.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Quick Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-1 space-y-4"
                    >
                        <Card className="p-6 text-center flex flex-col items-center border-border/50 bg-surface/50 backdrop-blur-md">
                            <div 
                                className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mb-4 shadow-inner relative group cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {user.picture ? (
                                    <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()
                                )}
                                
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                                {isUploadingAvatar && (
                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            <h2 className="text-xl font-bold text-foreground">{user.full_name || 'Anonymous User'}</h2>
                            <p className="text-sm text-gray-400 mt-1 mb-4">{user.email}</p>
                            
                            <Badge variant={user.is_superuser ? 'default' : 'secondary'} className="px-3 py-1 text-xs">
                                {user.is_superuser ? <><Shield className="w-3 h-3 mr-1" /> Administrator</> : 'Customer'}
                            </Badge>
                        </Card>
                    </motion.div>

                    {/* Main Details */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-2 space-y-6"
                    >
                        <Card className="p-6 border-border/50 bg-surface/50 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-foreground">Personal Information</h3>
                                <Button 
                                    variant={isEditing ? 'default' : 'outline'} 
                                    size="sm" 
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                >
                                    {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save Changes</> : 'Edit Profile'}
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-400 ml-1">Full Name</label>
                                    <div className="relative mt-2">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="pl-10 h-12 bg-background disabled:opacity-75 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-400 ml-1">Email Address</label>
                                    <div className="relative mt-2">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="email"
                                            disabled={true} // Usually email is not trivially editable
                                            value={formData.email}
                                            className="pl-10 h-12 bg-background opacity-75 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 ml-1">To change your email address, please contact support.</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-border/50 bg-surface/50 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Security Settings</h3>
                                    <p className="text-sm text-gray-400 mt-1">Update your password and secure your account.</p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Key className="w-4 h-4" /> Change Password
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
