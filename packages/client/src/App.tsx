import { useState, useEffect } from 'react'
import { client } from './client'

type User = {
  id: number
  name: string
  email: string
}

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await client.users.$get()
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email) {
      setError('Name and email are required')
      return
    }

    try {
      if (editingId) {
        // Update existing user
        const response = await client.users[':id'].$put({
          param: { id: editingId.toString() },
          json: { name, email },
        })

        if (response.ok) {
          const updatedUser = await response.json()
          setUsers(users.map((u) => (u.id === editingId ? updatedUser : u)))
          setEditingId(null)
        } else {
          setError('Failed to update user')
        }
      } else {
        // Create new user
        const response = await client.users.$post({
          json: { name, email },
        })

        if (response.ok) {
          const newUser = await response.json()
          setUsers([...users, newUser])
        } else {
          setError('Failed to create user')
        }
      }

      setName('')
      setEmail('')
    } catch (err) {
      console.error('Failed to submit:', err)
      setError('An error occurred')
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setName(user.name)
    setEmail(user.email)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setEmail('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const response = await client.users[':id'].$delete({
        param: { id: id.toString() },
      })

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== id))
      } else {
        setError('Failed to delete user')
      }
    } catch (err) {
      console.error('Failed to delete:', err)
      setError('An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Hono RPC Proof of Concept</h1>

      <div>
        <h2>Users</h2>
        {users.length === 0 ? (
          <p>No users found. Create one below!</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} className="user-item">
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
                <div className="user-actions">
                  <button
                    className="secondary"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form">
        <h2>{editingId ? 'Edit User' : 'Create New User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" className="primary">
              {editingId ? 'Update User' : 'Create User'}
            </button>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default App
