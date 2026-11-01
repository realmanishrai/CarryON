import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../shared/types';
import { ApiService } from '../../utils/api';
import { Check, Plus, Trash2, User, X } from 'lucide-react';

export const ProfileManager: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: '',
    college: '',
    degree: '',
    graduation_year: 2026,
    skills: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    ApiService.getProfile()
      .then((p) => {
        if (p) {
          setProfile({
            ...p,
            skills: p.skills || []
          });
        }
      })
      .catch((e) => console.warn('Could not load profile:', e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    try {
      await ApiService.saveProfile(profile);
      setSaveStatus('Profile saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message}`);
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const trimmed = skillInput.trim();
    if (!profile.skills.includes(trimmed)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill)
    }));
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your saved profile?')) return;
    try {
      await ApiService.deleteProfile();
      setProfile({
        full_name: '',
        email: '',
        phone: '',
        college: '',
        degree: '',
        graduation_year: 2026,
        skills: []
      });
      setSaveStatus('Profile cleared.');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider">
            Applicant Profile Memory
          </h2>
          <p className="text-[11px] text-[#9CA3AF]">
            CarryON stores your approved credentials locally for one-click application autofill.
          </p>
        </div>
        <button
          onClick={handleDeleteProfile}
          title="Delete saved profile"
          className="p-1.5 rounded text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">Full Name</label>
          <input
            type="text"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="e.g. Alex Mercer"
            className="w-full bg-[#121620] border border-[#293244] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#8B7CFF]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">Email</label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="alex@example.com"
              className="w-full bg-[#121620] border border-[#293244] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">Phone</label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1-555-0199"
              className="w-full bg-[#121620] border border-[#293244] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">College / University</label>
          <input
            type="text"
            value={profile.college || ''}
            onChange={(e) => setProfile({ ...profile, college: e.target.value })}
            placeholder="e.g. Stanford University"
            className="w-full bg-[#121620] border border-[#293244] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#8B7CFF]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">Degree</label>
            <input
              type="text"
              value={profile.degree || ''}
              onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
              placeholder="e.g. B.S. Computer Science"
              className="w-full bg-[#121620] border border-[#293244] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">Graduation Year</label>
            <input
              type="number"
              value={profile.graduation_year || ''}
              onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value, 10) || undefined })}
              placeholder="2026"
              className="w-full bg-[#121620] border border-[#293244] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>
        </div>

        {/* Skills Tag Management */}
        <div>
          <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">Skills &amp; Technologies</label>
          <div className="flex items-center gap-1.5 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Type skill & press Enter..."
              className="flex-1 bg-[#121620] border border-[#293244] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#8B7CFF]"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="p-1.5 rounded-lg bg-[#191F2B] border border-[#293244] text-[#8B7CFF] hover:bg-[#293244]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-[#0B0D12] rounded-lg border border-[#293244]">
            {profile.skills.length === 0 ? (
              <span className="text-[11px] text-[#64748B]">No skills added yet.</span>
            ) : (
              profile.skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 text-[11px]"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {saveStatus && (
          <div
            className={`p-2 rounded text-xs text-center font-medium ${
              saveStatus.includes('successfully') || saveStatus.includes('cleared')
                ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30'
                : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
            }`}
          >
            {saveStatus}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-3 rounded-lg bg-[#8B7CFF] hover:bg-[#7A6AE6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Profile Memory</span>
        </button>
      </form>
    </div>
  );
};
