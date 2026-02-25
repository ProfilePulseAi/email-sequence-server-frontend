'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOutreach, updateOutreach } from '@/lib/api';
import { MailBox, OutreachDto, State, Template, OutreachType } from '@/types';

interface OutreachFormProps {
  outreach?: OutreachDto;
  templates?: Template[];
  mailboxes?: MailBox[];
  onSuccess?: () => void;
}

const MIN_SCHEDULE_DELAY_HOURS = 0.5;
const MAX_SCHEDULE_DELAY_HOURS = 100;
const SCHEDULE_DELAY_STEP_HOURS = 0.5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const roundToStep = (value: number, step: number) => Math.round(value / step) * step;

const toScheduleDelayHours = (scheduledAt?: string | Date): string => {
  if (!scheduledAt) {
    return `${MIN_SCHEDULE_DELAY_HOURS}`;
  }

  const targetTime = new Date(scheduledAt);
  if (Number.isNaN(targetTime.getTime())) {
    return `${MIN_SCHEDULE_DELAY_HOURS}`;
  }

  const delayHours = (targetTime.getTime() - Date.now()) / (60 * 60 * 1000);
  const normalized = clamp(roundToStep(delayHours, SCHEDULE_DELAY_STEP_HOURS), MIN_SCHEDULE_DELAY_HOURS, MAX_SCHEDULE_DELAY_HOURS);
  return Number(normalized.toFixed(2)).toString();
};

const createDefaultState = (templateId: string): State => ({
  name: 'initial',
  scheduleAfterDays: 0,
  description: 'Initial email',
  templateId,
});

export default function OutreachForm({ outreach, templates = [], mailboxes = [], onSuccess }: OutreachFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultTemplateId = useMemo(() => templates[0]?.id?.toString() || '', [templates]);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    mailboxId: '',
    outreachType: 'sequence' as OutreachType,
    scheduledDelayHours: `${MIN_SCHEDULE_DELAY_HOURS}`,
  });

  const [stateList, setStateList] = useState<State[]>([createDefaultState(defaultTemplateId)]);

  useEffect(() => {
    if (outreach) {
      const normalizedType = (outreach.outreachType || 'sequence') as OutreachType;
      setFormData({
        name: outreach.name,
        subject: outreach.subject || '',
        mailboxId: outreach.mailboxId != null ? outreach.mailboxId.toString() : '',
        outreachType: normalizedType,
        scheduledDelayHours: toScheduleDelayHours(outreach.scheduledAt),
      });

      const normalizedStages = (outreach.stateList?.length ? outreach.stateList : [createDefaultState(defaultTemplateId)]).map(
        (stage, index) => ({
          name: stage.name || `stage_${index + 1}`,
          scheduleAfterDays: Number(stage.scheduleAfterDays) || 0,
          description: stage.description || '',
          templateId: stage.templateId?.toString() || defaultTemplateId,
        }),
      );

      setStateList(normalizedStages);
      return;
    }

    setFormData({
      name: '',
      subject: '',
      mailboxId: '',
      outreachType: 'sequence',
      scheduledDelayHours: `${MIN_SCHEDULE_DELAY_HOURS}`,
    });
    setStateList([createDefaultState(defaultTemplateId)]);
  }, [outreach, defaultTemplateId]);

  useEffect(() => {
    if (!defaultTemplateId) {
      return;
    }

    setStateList((prev) =>
      prev.map((stage) => ({
        ...stage,
        templateId: stage.templateId || defaultTemplateId,
      })),
    );
  }, [defaultTemplateId]);

  const addState = () => {
    setStateList([
      ...stateList,
      {
        name: `stage_${stateList.length + 1}`,
        scheduleAfterDays: 3,
        description: '',
        templateId: defaultTemplateId,
      },
    ]);
  };

  const removeState = (index: number) => {
    if (stateList.length > 1) {
      setStateList(stateList.filter((_, i) => i !== index));
    }
  };

  const updateState = (index: number, field: keyof State, value: string | number) => {
    const newStateList = [...stateList];
    newStateList[index] = { ...newStateList[index], [field]: value };
    setStateList(newStateList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!templates.length) {
      alert('Please create at least one template before creating outreach campaigns.');
      return;
    }

    setLoading(true);

    try {
      const selectedType = formData.outreachType || 'sequence';
      const baseStates =
        selectedType === 'sequence' ? stateList : [stateList[0] || createDefaultState(defaultTemplateId)];

      const normalizedStateList = baseStates.map((state, index) => ({
        name: state.name || `stage_${index + 1}`,
        scheduleAfterDays: selectedType === 'sequence' ? Number(state.scheduleAfterDays) || 0 : 0,
        description: state.description || '',
        templateId: state.templateId || defaultTemplateId,
      }));

      if (normalizedStateList.some((state) => !state.templateId)) {
        alert('Please select a template ID for each stage.');
        return;
      }

      let scheduledAtIso: string | undefined;
      if (selectedType === 'scheduled') {
        const delayHours = Number(formData.scheduledDelayHours);
        if (!Number.isFinite(delayHours)) {
          alert('Scheduled delay is invalid.');
          return;
        }

        if (delayHours < MIN_SCHEDULE_DELAY_HOURS || delayHours > MAX_SCHEDULE_DELAY_HOURS) {
          alert(`Scheduled delay must be between ${MIN_SCHEDULE_DELAY_HOURS} and ${MAX_SCHEDULE_DELAY_HOURS} hours.`);
          return;
        }

        scheduledAtIso = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();
      }

      const outreachDataToSave = {
        name: formData.name,
        subject: formData.subject,
        mailboxId: formData.mailboxId ? Number(formData.mailboxId) : null,
        outreachType: selectedType,
        scheduledAt: scheduledAtIso,
        stateList: normalizedStateList,
      };

      if (outreach?.id) {
        await updateOutreach(outreach.id, outreachDataToSave);
      } else {
        await createOutreach(outreachDataToSave);
      }

      onSuccess?.();
      router.push('/dashboard/outreach');
    } catch (error) {
      console.error('Error saving outreach:', error);
      alert('Error saving outreach campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayedStateList = formData.outreachType === 'sequence' ? stateList : stateList.slice(0, 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div>
            <label htmlFor="mailboxId" className="block text-sm font-medium text-gray-700 mb-2">
              Mailbox ID
            </label>
            <select
              id="mailboxId"
              value={formData.mailboxId}
              onChange={(e) => setFormData((prev) => ({ ...prev, mailboxId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None (Use bidding pool)</option>
              {mailboxes.map((mailbox) => (
                <option key={mailbox.id} value={mailbox.id.toString()}>
                  {mailbox.id} - {mailbox.name} ({mailbox.emailId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="outreachType" className="block text-sm font-medium text-gray-700 mb-2">
              Outreach Type *
            </label>
            <select
              id="outreachType"
              value={formData.outreachType}
              onChange={(e) => {
                const nextType = e.target.value as OutreachType;
                setFormData((prev) => ({
                  ...prev,
                  outreachType: nextType,
                  scheduledDelayHours:
                    nextType === 'scheduled' ? prev.scheduledDelayHours || `${MIN_SCHEDULE_DELAY_HOURS}` : `${MIN_SCHEDULE_DELAY_HOURS}`,
                }));

                if (nextType !== 'sequence') {
                  setStateList((prev) => {
                    const firstState = prev[0] || createDefaultState(defaultTemplateId);
                    return [
                      {
                        ...firstState,
                        scheduleAfterDays: 0,
                      },
                    ];
                  });
                } else {
                  setStateList((prev) => (prev.length ? prev : [createDefaultState(defaultTemplateId)]));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="sequence">Sequence (default)</option>
              <option value="immediate">Immediate</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* subject field moved below grid */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Email Subject *
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email subject"
            required
          />
        </div>

        {formData.outreachType === 'scheduled' && (
          <div>
            <label htmlFor="scheduledDelayHours" className="block text-sm font-medium text-gray-700 mb-2">
              Send After (Hours) *
            </label>
            <input
              type="number"
              id="scheduledDelayHours"
              min={MIN_SCHEDULE_DELAY_HOURS}
              max={MAX_SCHEDULE_DELAY_HOURS}
              step={SCHEDULE_DELAY_STEP_HOURS}
              value={formData.scheduledDelayHours}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDelayHours: e.target.value }))}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 30 minutes (0.5 hours), maximum 100 hours.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              {formData.outreachType === 'sequence' ? 'Email Sequence *' : 'Email Template *'}
            </label>
            {formData.outreachType === 'sequence' && (
              <button
                type="button"
                onClick={addState}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Add Stage
              </button>
            )}
          </div>

          {displayedStateList.map((state, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Stage {index + 1}</h4>
                {formData.outreachType === 'sequence' && stateList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeState(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stage Name</label>
                  <input
                    type="text"
                    value={state.name}
                    onChange={(e) => updateState(index, 'name', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="Stage name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {formData.outreachType === 'sequence' ? 'Days After Previous' : 'Delivery Timing'}
                  </label>
                  {formData.outreachType === 'sequence' ? (
                    <input
                      type="number"
                      min="0"
                      value={state.scheduleAfterDays}
                      onChange={(e) => updateState(index, 'scheduleAfterDays', parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-gray-600">
                      {formData.outreachType === 'immediate'
                        ? 'Sent immediately on client add'
                        : `Uses campaign delay (${formData.scheduledDelayHours || MIN_SCHEDULE_DELAY_HOURS} hours)`}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Template ID</label>
                  <select
                    value={state.templateId}
                    onChange={(e) => updateState(index, 'templateId', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    {templates.length === 0 && <option value="">No templates available</option>}
                    {templates.map((template) => (
                      <option key={template.id} value={template.id.toString()}>
                        ID {template.id} - {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={state.description}
                  onChange={(e) => updateState(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Stage description"
                />
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <p className="text-sm text-orange-600">No templates found. Create templates first to continue.</p>
          )}

          <p className="text-sm text-gray-500">
            {formData.outreachType === 'sequence'
              ? 'Create a sequence of emails. Each stage can use a different template ID and timing.'
              : 'Select one template ID from your available templates.'}
          </p>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/dashboard/outreach')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || displayedStateList.length === 0 || templates.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {outreach ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
