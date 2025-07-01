'use client';

import { Handle, Position } from 'reactflow';
import { FlowNodeData } from '@/types';

interface CustomNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

export function EmailSentNode({ data, selected }: CustomNodeProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-blue-50 min-w-[120px] ${
      selected ? 'border-blue-500' : 'border-blue-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-blue-800 font-semibold text-sm">📧 Send Email</div>
        {data.templateId && (
          <div className="text-xs text-blue-600 mt-1">Template: {data.templateId}</div>
        )}
        {data.description && (
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function WaitNode({ data, selected }: CustomNodeProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-yellow-50 min-w-[120px] ${
      selected ? 'border-yellow-500' : 'border-yellow-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-yellow-800 font-semibold text-sm">⏰ Wait</div>
        <div className="text-xs text-yellow-600">
          {data.waitDays || 1} day{(data.waitDays || 1) !== 1 ? 's' : ''}
        </div>
        {data.description && (
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function ConditionNode({ data, selected }: CustomNodeProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-purple-50 min-w-[120px] ${
      selected ? 'border-purple-500' : 'border-purple-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-purple-800 font-semibold text-sm">❓ Condition</div>
        <div className="text-xs text-purple-600">{data.condition || 'Yes/No'}</div>
        {data.description && (
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="yes" />
      <Handle type="source" position={Position.Left} id="no" />
    </div>
  );
}

export function LinkClickNode({ data, selected }: CustomNodeProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-green-50 min-w-[120px] ${
      selected ? 'border-green-500' : 'border-green-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-green-800 font-semibold text-sm">🔗 Link Clicked</div>
        {data.description && (
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function RepliedNode({ data, selected }: CustomNodeProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-orange-50 min-w-[120px] ${
      selected ? 'border-orange-500' : 'border-orange-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-orange-800 font-semibold text-sm">💬 Email Replied</div>
        {data.description && (
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function StartNode({ data, selected }: CustomNodeProps) {
  return (
    <div className={`px-4 py-3 rounded-full border-2 bg-gray-50 min-w-[100px] ${
      selected ? 'border-gray-500' : 'border-gray-300'
    }`}>
      <div className="text-center">
        <div className="text-gray-800 font-semibold text-sm">🚀 Start</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function EndNode({ data, selected }: CustomNodeProps) {
  return (
    <div className={`px-4 py-3 rounded-full border-2 bg-red-50 min-w-[100px] ${
      selected ? 'border-red-500' : 'border-red-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-red-800 font-semibold text-sm">🏁 End</div>
      </div>
    </div>
  );
}
