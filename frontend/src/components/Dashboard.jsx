import React from 'react';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-2xl">
                {user.role === 'student' && '👨‍🎓'}
                {user.role === 'company' && '🏢'}
                {user.role === 'admin' && '🛡️'}
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </h1>
                <p className="text-blue-200 mt-1 text-lg">Welcome back, {user.name}!</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-2xl transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8">
          {/* Welcome Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-4xl shadow-2xl animate-pulse">
                {user.role === 'student' && '👨‍🎓'}
                {user.role === 'company' && '🏢'}
                {user.role === 'admin' && '🛡️'}
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
                  {user.role === 'student' && 'Student Portal'}
                  {user.role === 'company' && 'Company Portal'}
                  {user.role === 'admin' && 'Admin Portal'}
                </h2>
                <p className="text-blue-200 text-xl">
                  {user.role === 'student' && 'Find and apply for attachment opportunities'}
                  {user.role === 'company' && 'Manage opportunities and review applications'}
                  {user.role === 'admin' && 'System administration and analytics'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white text-3xl">📋</span>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">
                    {user.role === 'student' && 'Applications'}
                    {user.role === 'company' && 'Opportunities'}
                    {user.role === 'admin' && 'Total Users'}
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {user.role === 'admin' ? '12' : '5'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white text-3xl">✅</span>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-green-200 uppercase tracking-wider mb-2">
                    {user.role === 'student' && 'Accepted'}
                    {user.role === 'company' && 'Active'}
                    {user.role === 'admin' && 'Active Systems'}
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    {user.role === 'admin' ? '8' : '2'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white text-3xl">⏳</span>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-bold text-purple-200 uppercase tracking-wider mb-2">
                    {user.role === 'student' && 'Pending'}
                    {user.role === 'company' && 'Pending Review'}
                    {user.role === 'admin' && 'Pending Approvals'}
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">3</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-8">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-400/30">
                <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Full Name</p>
                <p className="text-white font-bold text-2xl">{user.name}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm p-6 rounded-2xl border border-green-400/30">
                <p className="text-sm font-bold text-green-200 uppercase tracking-wider mb-2">Email Address</p>
                <p className="text-white font-bold text-2xl">{user.email}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-400/30">
                <p className="text-sm font-bold text-purple-200 uppercase tracking-wider mb-2">Account Type</p>
                <span className={`inline-flex px-6 py-3 rounded-full text-lg font-bold shadow-2xl ${
                  user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                  user.role === 'company' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                  'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm p-6 rounded-2xl border border-orange-400/30">
                <p className="text-sm font-bold text-orange-200 uppercase tracking-wider mb-2">User ID</p>
                <p className="text-white font-bold text-2xl">#{user.id}</p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:from-green-500/30 hover:via-blue-500/30 hover:to-purple-500/30 transition-all duration-500">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent mb-8 flex items-center">
              <span className="mr-4 text-4xl">🚀</span>
              System Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full mx-auto mb-4 shadow-2xl animate-pulse"></div>
                <p className="text-lg font-bold text-green-200">API Connected</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full mx-auto mb-4 shadow-2xl animate-pulse"></div>
                <p className="text-lg font-bold text-green-200">Database Online</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full mx-auto mb-4 shadow-2xl animate-pulse"></div>
                <p className="text-lg font-bold text-green-200">Authentication</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full mx-auto mb-4 shadow-2xl animate-pulse"></div>
                <p className="text-lg font-bold text-green-200">All Systems</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-8">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {user.role === 'student' && (
                <>
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">🔍</div>
                    Browse Opportunities
                  </button>
                  <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">📝</div>
                    My Applications
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">👤</div>
                    Update Profile
                  </button>
                </>
              )}
              {user.role === 'company' && (
                <>
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">➕</div>
                    Post Opportunity
                  </button>
                  <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">📋</div>
                    Review Applications
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">🏢</div>
                    Company Profile
                  </button>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">📊</div>
                    System Analytics
                  </button>
                  <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">👥</div>
                    Manage Users
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105">
                    <div className="text-3xl mb-2">⚙️</div>
                    System Settings
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;