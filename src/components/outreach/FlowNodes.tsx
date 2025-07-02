'use client';

import { Handle, Position } from 'reactflow';
import { FlowNodeData } from '@/types';

interface CustomNodeProps {
  data: FlowNodeData;
  selected?: boolean;
}

export function EmailSentNode({ data, selected }: CustomNodeProps) {
  // This is now used for PERFORM_ACTION nodes
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-blue-50 min-w-[120px] ${
      selected ? 'border-blue-500' : 'border-blue-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-blue-800 font-semibold text-sm">
          {data.actionType === 'send_email' ? '📧 Send Email' : 
           data.actionType === 'create_task' ? '📝 Create Task' : '⚡ Action'}
        </div>
        {data.actionType === 'send_email' && data.templateId && (
          <div className="text-xs text-blue-600 mt-1">Template: {data.templateId}</div>
        )}
        {data.actionType === 'create_task' && data.taskTitle && (
          <div className="text-xs text-blue-600 mt-1">{data.taskTitle}</div>
        )}
        {data.actionType === 'create_task' && data.taskPlatform && (
          <div className="text-xs text-blue-500 mt-1">{data.taskPlatform}</div>
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
  const waitDisplay = data.waitValue && data.waitUnit 
    ? `${data.waitValue} ${data.waitUnit}` 
    : `${data.waitDays || 1} day${(data.waitDays || 1) !== 1 ? 's' : ''}`;
    
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-yellow-50 min-w-[120px] ${
      selected ? 'border-yellow-500' : 'border-yellow-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-yellow-800 font-semibold text-sm">⏰ Wait</div>
        <div className="text-xs text-yellow-600">{waitDisplay}</div>
        {data.cancelActions && data.cancelActions.length > 0 && (
          <div className="text-xs text-yellow-500 mt-1">
            Cancel on: {data.cancelActions.join(', ')}
          </div>
        )}
        {data.description && (
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
      {/* Additional handles for cancel actions */}
      {data.cancelActions?.includes('email_replied') && (
        <Handle type="source" position={Position.Left} id="replied" />
      )}
      {data.cancelActions?.includes('link_clicked') && (
        <Handle type="source" position={Position.Right} id="clicked" />
      )}
      {data.cancelActions?.includes('email_opened') && (
        <Handle type="source" position={Position.Right} id="opened" style={{ right: '10px' }} />
      )}
      <Handle type="source" position={Position.Bottom} id="timeout" />
    </div>
  );
}

export function ConditionNode({ data, selected }: CustomNodeProps) {
  // This is now used for WAIT_ACTION nodes
  const getActionIcon = () => {
    switch (data.actionType) {
      case 'email_replied': return '💬';
      case 'link_clicked': return '🔗';
      case 'email_opened': return '👁️';
      default: return '❓';
    }
  };
  
  const getActionLabel = () => {
    switch (data.actionType) {
      case 'email_replied': return 'Email Replied';
      case 'link_clicked': return 'Link Clicked';
      case 'email_opened': return 'Email Opened';
      default: return 'Wait Action';
    }
  };
  
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-orange-50 min-w-[120px] ${
      selected ? 'border-orange-500' : 'border-orange-300'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-orange-800 font-semibold text-sm">
          {getActionIcon()} {getActionLabel()}
        </div>
        {data.specificLink && (
          <div className="text-xs text-orange-600 mt-1">
            {data.specificLink.length > 20 ? `${data.specificLink.substring(0, 20)}...` : data.specificLink}
          </div>
        )}
        {data.description && (
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
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

export function StartNode({ selected }: CustomNodeProps) {
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
        {data.description && (
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        )}
      </div>
    </div>
  );
}
