import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Shield, ShieldOff, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

interface AdminUser {
    id: number
    email: string
    full_name?: string
    is_active: boolean
    is_superuser: boolean
}

export default function UserList() {
    const queryClient = useQueryClient()
    const { user: currentUser } = useAuth()

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await axios.get('/api/v1/admin/users')
            return res.data as AdminUser[]
        },
        refetchInterval: 30000
    })

    const toggleActiveMutation = useMutation({
        mutationFn: async (id: number) => {
            await axios.put(`/api/v1/admin/users/${id}/active`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            toast.success('User status updated')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.detail || 'Failed to update user')
        }
    })

    const toggleSuperuserMutation = useMutation({
        mutationFn: async (id: number) => {
            await axios.put(`/api/v1/admin/users/${id}/superuser`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            toast.success('User role updated')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.detail || 'Failed to update user role')
        }
    })

    if (isLoading) return <div className="p-8 text-center text-foreground">Loading Users...</div>
    if (isError) return <div className="p-8 text-center text-danger">Error loading users</div>

    return (
        <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/50">
                    <thead className="bg-surface-hover">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {users?.map(user => (
                            <tr key={user.id} className="hover:bg-surface-hover/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">#{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.full_name || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${user.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {user.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${user.is_superuser ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface border-border text-foreground/70'}`}>
                                        {user.is_superuser ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleActiveMutation.mutate(user.id)}
                                            disabled={user.id === currentUser?.id}
                                            className="text-foreground/70 hover:text-foreground transition-colors disabled:opacity-30"
                                            title={user.is_active ? "Disable User" : "Enable User"}
                                        >
                                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => toggleSuperuserMutation.mutate(user.id)}
                                            disabled={user.id === currentUser?.id}
                                            className="text-foreground/70 hover:text-foreground transition-colors disabled:opacity-30"
                                            title={user.is_superuser ? "Demote from Admin" : "Promote to Admin"}
                                        >
                                            {user.is_superuser ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users?.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
