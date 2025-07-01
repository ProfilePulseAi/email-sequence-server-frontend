'use client';

import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  EmailSentNode,
  WaitNode,
  ConditionNode,
  LinkClickNode,
  RepliedNode,
  StartNode,
  EndNode,
} from './FlowNodes';
import { FlowNode, FlowEdge, OutreachDto, Template } from '@/types';

interface OutreachFlowBuilderProps {
  outreach?: OutreachDto;
  templates?: Template[];
  onSave?: (outreach: OutreachDto) => void;
  onCancel?: () => void;
}

const nodeTypes: NodeTypes = {
  emailSent: EmailSentNode,
  wait: WaitNode,
  condition: ConditionNode,
  linkClick: LinkClickNode,
  replied: RepliedNode,
  start: StartNode,
  end: EndNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 25 },
    data: { label: 'Start', type: 'start' },
  },
  {
    id: '2',
    type: 'emailSent',
    position: { x: 200, y: 125 },
    data: { 
      label: 'Send Email', 
      type: 'email',
      templateId: '1',
      description: 'Initial outreach email'
    },
  },
  {
    id: '3',
    type: 'condition',
    position: { x: 200, y: 225 },
    data: { 
      label: 'Link Clicked?', 
      type: 'condition',
      condition: 'Link Clicked?'
    },
  },
  {
    id: '4',
    type: 'wait',
    position: { x: 50, y: 325 },
    data: { 
      label: 'Wait 3 Days', 
      type: 'wait',
      waitDays: 3,
      description: 'No link clicked'
    },
  },
  {
    id: '5',
    type: 'wait',
    position: { x: 350, y: 325 },
    data: { 
      label: 'Wait 5 Days', 
      type: 'wait',
      waitDays: 5,
      description: 'Link clicked'
    },
  },
  {
    id: '6',
    type: 'condition',
    position: { x: 200, y: 425 },
    data: { 
      label: 'Email Replied?', 
      type: 'condition',
      condition: 'Email Replied?'
    },
  },
  {
    id: '7',
    type: 'end',
    position: { x: 350, y: 525 },
    data: { label: 'End Flow', type: 'end' },
  },
  {
    id: '8',
    type: 'emailSent',
    position: { x: 50, y: 525 },
    data: { 
      label: 'Follow-up Email', 
      type: 'email',
      templateId: '2',
      description: 'Follow-up email'
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    sourceHandle: 'no',
    label: 'No',
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    sourceHandle: 'yes',
    label: 'Yes',
  },
  {
    id: 'e4-6',
    source: '4',
    target: '6',
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
  },
  {
    id: 'e6-7',
    source: '6',
    target: '7',
    sourceHandle: 'yes',
    label: 'Yes',
  },
  {
    id: 'e6-8',
    source: '6',
    target: '8',
    sourceHandle: 'no',
    label: 'No',
  },
];

export default function OutreachFlowBuilder({
  outreach,
  templates = [],
  onSave,
  onCancel,
}: OutreachFlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [outreachName, setOutreachName] = useState(outreach?.name || '');
  const [outreachSubject, setOutreachSubject] = useState(outreach?.subject || '');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNewNode = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 200,
      },
      data: {
        label: getNodeLabel(nodeType),
        type: nodeType as any,
        ...(nodeType === 'wait' && { waitDays: 1 }),
        ...(nodeType === 'condition' && { condition: 'Condition?' }),
        ...(nodeType === 'emailSent' && { templateId: templates[0]?.id?.toString() || '1' }),
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, templates]);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<any>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const convertFlowToOutreach = useCallback((): OutreachDto => {
    // Convert the flow to outreach state list format
    const stateList = nodes
      .filter(node => node.type === 'emailSent')
      .map((node, index) => ({
        name: `state_${index + 1}`,
        scheduleAfterDays: getWaitDaysForEmailNode(node.id),
        description: node.data.description || node.data.label,
        templateId: node.data.templateId || '1',
      }));

    return {
      id: outreach?.id,
      name: outreachName,
      subject: outreachSubject,
      stateList,
      userId: outreach?.userId,
      isActive: outreach?.isActive ?? true,
    };
  }, [nodes, edges, outreachName, outreachSubject, outreach]);

  const getWaitDaysForEmailNode = (emailNodeId: string): number => {
    // Find wait nodes connected to this email node
    const waitEdge = edges.find(edge => edge.target === emailNodeId);
    if (waitEdge) {
      const waitNode = nodes.find(node => node.id === waitEdge.source);
      if (waitNode && waitNode.type === 'wait') {
        return waitNode.data.waitDays || 1;
      }
    }
    return 1; // default
  };

  const handleSave = () => {
    if (!outreachName.trim() || !outreachSubject.trim()) {
      alert('Please enter outreach name and subject');
      return;
    }
    
    const outreachData = convertFlowToOutreach();
    onSave?.(outreachData);
  };

  function getNodeLabel(nodeType: string): string {
    switch (nodeType) {
      case 'emailSent': return 'Send Email';
      case 'wait': return 'Wait';
      case 'condition': return 'Condition';
      case 'linkClick': return 'Link Clicked';
      case 'replied': return 'Email Replied';
      case 'start': return 'Start';
      case 'end': return 'End';
      default: return 'Node';
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outreach Name *
                </label>
                <input
                  type="text"
                  value={outreachName}
                  onChange={(e) => setOutreachName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter outreach campaign name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={outreachSubject}
                  onChange={(e) => setOutreachSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email subject line"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Flow
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-2">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => addNewNode('emailSent')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            + Email
          </button>
          <button
            onClick={() => addNewNode('wait')}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
          >
            + Wait
          </button>
          <button
            onClick={() => addNewNode('condition')}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
          >
            + Condition
          </button>
          <button
            onClick={() => addNewNode('linkClick')}
            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
          >
            + Link Click
          </button>
          <button
            onClick={() => addNewNode('replied')}
            className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
          >
            + Reply
          </button>
          <button
            onClick={() => addNewNode('end')}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            + End
          </button>
        </div>
      </div>

      {/* Flow Editor */}
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-gray-900">Node Properties</h3>
                <p className="text-sm text-gray-600">{selectedNode.data.label}</p>
              </div>

              {selectedNode.type === 'emailSent' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template
                    </label>
                    <select
                      value={selectedNode.data.templateId || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { templateId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id.toString()}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedNode.data.description || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter description..."
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'wait' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wait Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={selectedNode.data.waitDays || 1}
                      onChange={(e) => updateNodeData(selectedNode.id, { waitDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedNode.data.description || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter description..."
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.condition || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { condition: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter condition..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedNode.data.description || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter description..."
                    />
                  </div>
                </div>
              )}

              {(selectedNode.type === 'linkClick' || selectedNode.type === 'replied') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={selectedNode.data.description || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter description..."
                  />
                </div>
              )}

              {selectedNode.type !== 'start' && selectedNode.type !== 'end' && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Node
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
