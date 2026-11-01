import React, { useState } from 'react';
import { useWorkflow } from './hooks/useWorkflow';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AssistantChat } from './components/AssistantChat';
import { RecoveryPanel } from './components/RecoveryPanel';
import { AutofillPanel } from './components/AutofillPanel';
import { ProfileManager } from './components/ProfileManager';
import { SettingsModal } from './components/SettingsModal';
import { MSG_TYPES } from '../shared/messages';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    scanResult,
    workflow,
    isScanning,
    backendStatus,
    aiStatus,
    scanPage,
    checkHealth,
    highlightField,
    scrollToField,
    clearAllHighlights,
    saveCheckpoint,
    sendMessageToActiveTab
  } = useWorkflow();

  const handleLocateError = (fieldId: string, message: string, severity: string) => {
    highlightField(fieldId, message, severity);
    scrollToField(fieldId);
  };

  const handleApplyFix = async (fieldId: string, value: string) => {
    await sendMessageToActiveTab(MSG_TYPES.AUTOFILL_FIELDS, {
      fields: [{ field_id: fieldId, value }]
    });
    // Rescan after applying fix
    setTimeout(scanPage, 200);
  };

  const handleAutofillFields = async (fields: Array<{ field_id: string; value: string }>) => {
    const res = await sendMessageToActiveTab(MSG_TYPES.AUTOFILL_FIELDS, { fields });
    setTimeout(scanPage, 200);
    return res;
  };

  const handleRestoreFields = async (fields: Record<string, any>) => {
    const res = await sendMessageToActiveTab(MSG_TYPES.RESTORE_FIELDS, { fields });
    setTimeout(scanPage, 200);
    return res;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0D12] text-[#F3F4F6] font-sans">
      {/* Extension Header */}
      <Header
        backendStatus={backendStatus}
        aiStatus={aiStatus}
        isScanning={isScanning}
        onScan={scanPage}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Tab Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        errorCount={scanResult?.errors?.length || 0}
      />

      {/* Active Screen Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <Dashboard
            workflow={workflow}
            scanResult={scanResult}
            isScanning={isScanning}
            onScan={scanPage}
            onSaveCheckpoint={saveCheckpoint}
            onLocateError={handleLocateError}
            onApplyFix={handleApplyFix}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantChat
            scanResult={scanResult}
            onScrollToField={(fid) => {
              scrollToField(fid);
              highlightField(fid, 'Selected by Assistant', 'info');
            }}
            onApplyFix={handleApplyFix}
          />
        )}

        {activeTab === 'recovery' && (
          <RecoveryPanel
            workflow={workflow}
            scanResult={scanResult}
            onLocateError={handleLocateError}
            onApplyFix={handleApplyFix}
            onRestoreFields={handleRestoreFields}
          />
        )}

        {activeTab === 'autofill' && (
          <AutofillPanel
            scanResult={scanResult}
            onAutofillFields={handleAutofillFields}
          />
        )}

        {activeTab === 'profile' && <ProfileManager />}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={checkHealth}
      />
    </div>
  );
};
export default App;
