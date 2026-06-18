import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser } from '../../services/api';
import Card from '../ui/Card';

export default function AdminDashboard({ token, onCancel }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { ok, data } = await getUsers(token);
      if (ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(''); // empty so it only updates if typed
    setRole(user.role);
    setFormError('');
  };

  const handleAddNew = () => {
    setEditingUser({ id: 'new' });
    setUsername('');
    setPassword('');
    setRole('user');
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingUser.id === 'new') {
        if (!password) {
          setFormError('Password is required for new users.');
          setFormLoading(false);
          return;
        }
        const { ok, error } = await createUser(token, { username, password, role });
        if (!ok) throw new Error(error);
      } else {
        const updateData = { role };
        if (password) updateData.password = password; // only send if resetting
        const { ok, error } = await updateUser(token, editingUser.id, updateData);
        if (!ok) throw new Error(error);
      }
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to save user.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2 className="admin-title">Admin Dashboard</h2>
        <button onClick={onCancel} className="nav-btn secondary btn-sm">Close Admin</button>
      </div>

      {editingUser ? (
        <Card title={editingUser.id === 'new' ? 'Add New User' : `Edit User: ${editingUser.username}`}>
          {formError && <p className="admin-error">{formError}</p>}
          <form onSubmit={handleSave} className="admin-form">
            {editingUser.id === 'new' && (
              <div className="section admin-form-section">
                <label className="section-label">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} required className="admin-input" />
              </div>
            )}
            <div className="section admin-form-section">
              <label className="section-label">{editingUser.id === 'new' ? 'Password' : 'New Password (leave blank to keep current)'}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" />
            </div>
            <div className="section admin-form-section">
              <label className="section-label">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="admin-input">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="nav-buttons">
              <button type="button" onClick={() => setEditingUser(null)} className="nav-btn secondary">Cancel</button>
              <button type="submit" disabled={formLoading} className="nav-btn primary">{formLoading ? 'Saving...' : 'Save User'}</button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="admin-card-header">
            <h3 className="admin-card-title">User Accounts</h3>
            <button onClick={handleAddNew} className="nav-btn primary btn-sm">Add User</button>
          </div>
          
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>
                        <span className={`tag role-tag ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-tertiary">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleEdit(u)} className="text-btn text-btn-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}