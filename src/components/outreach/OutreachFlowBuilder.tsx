'use client';

import { useState, useCallback, useEffect } from 'react';
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
  EndNode,
} from './FlowNodes';
import { OutreachDto, Template, FlowNodeData } from '@/types';
import { apiService } from '@/lib/api';

interface OutreachFlowBuilderProps {
  outreach?: OutreachDto;
  templates?: Template[];
  onSave?: (outreach: OutreachDto) => void;
  onCancel?: () => void;
  onChange?: (outreach: OutreachDto) => void;
}

const nodeTypes: NodeTypes = {
  wait: WaitNode,
  engagementTrigger: ConditionNode, // Repurposed for engagement triggers
  takeAction: EmailSentNode, // Repurposed for take actions
  end: EndNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'takeAction',
    position: { x: 250, y: 25 },
    data: { 
      label: 'Send Initial Email', 
      type: 'takeAction',
      actionType: 'send_email',
      templateId: '1',
      description: 'Initial outreach email'
    },
  },
  {
    id: '2',
    type: 'wait',
    position: { x: 250, y: 150 },
    data: { 
      label: 'Wait 3 Days', 
      type: 'wait',
      waitValue: 3,
      waitUnit: 'days',
      cancelActions: ['email_replied', 'link_clicked'],
      description: 'Wait for response or engagement'
    },
  },
  {
    id: '3',
    type: 'engagementTrigger',
    position: { x: 100, y: 300 },
    data: { 
      label: 'Email Replied?', 
      type: 'engagementTrigger',
      actionType: 'email_replied',
      condition: 'Email Replied'
    },
  },
  {
    id: '4',
    type: 'engagementTrigger',
    position: { x: 400, y: 300 },
    data: { 
      label: 'Link Clicked?', 
      type: 'engagementTrigger',
      actionType: 'link_clicked',
      condition: 'Link Clicked'
    },
  },
  {
    id: '5',
    type: 'end',
    position: { x: 100, y: 450 },
    data: { 
      label: 'End - Replied', 
      type: 'end',
      description: 'Customer replied - end flow'
    },
  },
  {
    id: '6',
    type: 'takeAction',
    position: { x: 400, y: 450 },
    data: { 
      label: 'Send Follow-up', 
      type: 'takeAction',
      actionType: 'send_email',
      templateId: '2',
      description: 'Follow-up email after link click'
    },
  },
  {
    id: '7',
    type: 'takeAction',
    position: { x: 250, y: 600 },
    data: { 
      label: 'Send Reminder', 
      type: 'takeAction',
      actionType: 'send_email',
      templateId: '3',
      description: 'Reminder email if no response'
    },
  },
  {
    id: '8',
    type: 'end',
    position: { x: 250, y: 750 },
    data: { 
      label: 'End Flow', 
      type: 'end',
      description: 'Campaign completed'
    },
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'Send Email',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourceHandle: 'replied',
    label: 'Replied',
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    sourceHandle: 'clicked',
    label: 'Link Clicked',
  },
  {
    id: 'e2-7',
    source: '2',
    target: '7',
    sourceHandle: 'timeout',
    label: 'No Response',
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    label: 'End',
  },
  {
    id: 'e4-6',
    source: '4',
    target: '6',
    label: 'Follow-up',
  },
  {
    id: 'e6-8',
    source: '6',
    target: '8',
    label: 'Complete',
  },
  {
    id: 'e7-8',
    source: '7',
    target: '8',
    label: 'Complete',
  },
];

export default function OutreachFlowBuilder({
  outreach,
  templates = [],
  onSave,
  onCancel,
  onChange,
}: OutreachFlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [outreachName, setOutreachName] = useState(outreach?.name || '');
  const [outreachSubject, setOutreachSubject] = useState(outreach?.subject || '');
  const [templateLinks, setTemplateLinks] = useState<{[templateId: string]: string[]}>({});

  // Function to parse links from template content
  const parseTemplateLinks = useCallback(async (templateId: string) => {
    if (!templateId || templateLinks[templateId]) return;
    
    try {
      const templateContent = await apiService.getTemplateContent(parseInt(templateId));
      const htmlContent = templateContent.htmlContent || '';
      
      // Parse href attributes from the HTML content
      const hrefRegex = /href=["']([^"']*)["']/gi;
      const links: string[] = [];
      let match;
      
      while ((match = hrefRegex.exec(htmlContent)) !== null) {
        const url = match[1];
        if (url && !url.startsWith('#') && !url.startsWith('mailto:')) {
          links.push(url);
        }
      }
      
      setTemplateLinks(prev => ({
        ...prev,
        [templateId]: links
      }));
    } catch (error) {
      console.error('Error parsing template links:', error);
    }
  }, [templateLinks]);

  // Function to get template links for wait nodes (from previous email action)
  const getLinksForWaitNode = useCallback((nodeId: string) => {
    // Find the previous email action node
    const incomingEdge = edges.find(edge => edge.target === nodeId);
    if (incomingEdge) {
      const sourceNode = nodes.find(node => node.id === incomingEdge.source);
      if (sourceNode?.type === 'takeAction' && sourceNode.data.actionType === 'send_email' && sourceNode.data.templateId) {
        return templateLinks[sourceNode.data.templateId] || [];
      }
    }
    return [];
  }, [edges, nodes, templateLinks]);

  // Effect to parse template links when a template is selected
  useEffect(() => {
    if (selectedNode?.type === 'takeAction' && selectedNode.data.templateId) {
      parseTemplateLinks(selectedNode.data.templateId);
    }
  }, [selectedNode, parseTemplateLinks]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const getWaitDaysForEmailNode = useCallback((emailNodeId: string): number => {
    // Find wait nodes connected to this email node
    const waitEdge = edges.find(edge => edge.target === emailNodeId);
    if (waitEdge) {
      const waitNode = nodes.find(node => node.id === waitEdge.source);
      if (waitNode && waitNode.type === 'wait') {
        return waitNode.data.waitDays || 1;
      }
    }
    return 1; // default
  }, [edges, nodes]);

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
        type: nodeType,
        ...(nodeType === 'wait' && { 
          waitValue: 1,
          waitUnit: 'days',
          cancelActions: []
        }),
        ...(nodeType === 'engagementTrigger' && { 
          actionType: 'email_replied',
          condition: 'Email Replied'
        }),
        ...(nodeType === 'takeAction' && { 
          actionType: 'send_email',
          templateId: templates[0]?.id?.toString() || '1'
        }),
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, templates]);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<FlowNodeData>) => {
    // Update nodes state
    setNodes((nds) => {
      const updatedNodes = nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      );
      
      // Trigger onChange immediately with updated nodes
      if (onChange) {
        setTimeout(() => {
          const stateList = updatedNodes
            .filter(node => node.type === 'emailSent')
            .map((node, index) => ({
              name: `state_${index + 1}`,
              scheduleAfterDays: getWaitDaysForEmailNode(node.id),
              description: node.data.description || node.data.label,
              templateId: node.data.templateId || '1',
            }));

          const outreachData = {
            id: outreach?.id,
            name: outreachName,
            subject: outreachSubject,
            stateList,
            userId: outreach?.userId,
            isActive: outreach?.isActive ?? true,
          };
          onChange(outreachData);
        }, 100); // Small delay to ensure state is updated
      }
      
      return updatedNodes;
    });
    
    // Update selected node if it's the one being updated
    setSelectedNode((current) => {
      if (current && current.id === nodeId) {
        return { ...current, data: { ...current.data, ...newData } };
      }
      return current;
    });
  }, [setNodes, setSelectedNode, onChange, edges, outreachName, outreachSubject, outreach, getWaitDaysForEmailNode]);

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
  }, [nodes, edges, outreachName, outreachSubject, outreach, getWaitDaysForEmailNode]);

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
      case 'wait': return 'Wait';
      case 'engagementTrigger': return 'Engagement Trigger';
      case 'takeAction': return 'Take Action';
      case 'end': return 'End';
      default: return 'Node';
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-end gap-4">
          <div className="flex-none w-80">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outreach Name *
            </label>
            <input
              type="text"
              value={outreachName}
              onChange={(e) => {
                setOutreachName(e.target.value);
                if (onChange) {
                  const outreachData = convertFlowToOutreach();
                  outreachData.name = e.target.value;
                  onChange(outreachData);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter campaign name"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject *
            </label>
            <input
              type="text"
              value={outreachSubject}
              onChange={(e) => {
                setOutreachSubject(e.target.value);
                if (onChange) {
                  const outreachData = convertFlowToOutreach();
                  outreachData.subject = e.target.value;
                  onChange(outreachData);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email subject line"
            />
          </div>
          <div className="flex gap-3 flex-none">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            onClick={() => addNewNode('wait')}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
          >
            + Wait
          </button>
          <button
            onClick={() => addNewNode('engagementTrigger')}
            className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
          >
            + Engagement Trigger
          </button>
          <button
            onClick={() => addNewNode('takeAction')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            + Take Action
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

              {/* WAIT NODE PROPERTIES */}
              {selectedNode.type === 'wait' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wait Duration
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={selectedNode.data.waitValue || 1}
                        onChange={(e) => updateNodeData(selectedNode.id, { waitValue: parseInt(e.target.value) })}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={selectedNode.data.waitUnit || 'days'}
                        onChange={(e) => updateNodeData(selectedNode.id, { waitUnit: e.target.value as 'hours' | 'days' })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancel Actions (Skip wait if these happen)
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedNode.data.cancelActions?.includes('email_opened') || false}
                          onChange={(e) => {
                            const actions = selectedNode.data.cancelActions || [];
                            const newActions = e.target.checked
                              ? [...actions, 'email_opened']
                              : actions.filter((a: string) => a !== 'email_opened');
                            updateNodeData(selectedNode.id, { cancelActions: newActions });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Email Opened</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedNode.data.cancelActions?.includes('email_replied') || false}
                          onChange={(e) => {
                            const actions = selectedNode.data.cancelActions || [];
                            const newActions = e.target.checked
                              ? [...actions, 'email_replied']
                              : actions.filter((a: string) => a !== 'email_replied');
                            updateNodeData(selectedNode.id, { cancelActions: newActions });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Email Replied</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedNode.data.cancelActions?.includes('link_clicked') || false}
                          onChange={(e) => {
                            const actions = selectedNode.data.cancelActions || [];
                            const newActions = e.target.checked
                              ? [...actions, 'link_clicked']
                              : actions.filter((a: string) => a !== 'link_clicked');
                            updateNodeData(selectedNode.id, { cancelActions: newActions });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Link Clicked</span>
                      </label>
                    </div>
                  </div>

                  {/* Show specific link selection if link_clicked is selected */}
                  {selectedNode.data.cancelActions?.includes('link_clicked') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specific Link (Optional)
                      </label>
                      <select
                        value={selectedNode.data.specificLink || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { specificLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Any link</option>
                        {getLinksForWaitNode(selectedNode.id).map((link, index) => (
                          <option key={index} value={link}>
                            {link.length > 40 ? `${link.substring(0, 40)}...` : link}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Links parsed from previous email templates
                      </p>
                    </div>
                  )}

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

              {/* ENGAGEMENT TRIGGER NODE PROPERTIES */}
              {selectedNode.type === 'engagementTrigger' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Type
                    </label>
                    <select
                      value={selectedNode.data.actionType || 'email_replied'}
                      onChange={(e) => updateNodeData(selectedNode.id, { actionType: e.target.value as FlowNodeData['actionType'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email_replied">Email Replied</option>
                      <option value="link_clicked">Link Clicked</option>
                      <option value="email_opened">Email Opened</option>
                    </select>
                  </div>
                  
                  {selectedNode.data.actionType === 'link_clicked' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specific Link
                      </label>
                      <select
                        value={selectedNode.data.specificLink || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { specificLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Any link</option>
                        {getLinksForWaitNode(selectedNode.id).map((link, index) => (
                          <option key={index} value={link}>
                            {link.length > 40 ? `${link.substring(0, 40)}...` : link}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Links parsed from email templates
                      </p>
                    </div>
                  )}

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

              {/* TAKE ACTION NODE PROPERTIES */}
              {selectedNode.type === 'takeAction' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Type
                    </label>
                    <select
                      value={selectedNode.data.actionType || 'send_email'}
                      onChange={(e) => updateNodeData(selectedNode.id, { actionType: e.target.value as FlowNodeData['actionType'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="send_email">Send Email</option>
                      <option value="create_task">Create Task</option>
                    </select>
                  </div>

                  {selectedNode.data.actionType === 'send_email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template
                      </label>
                      <select
                        value={selectedNode.data.templateId || ''}
                        onChange={(e) => {
                          updateNodeData(selectedNode.id, { templateId: e.target.value });
                          if (e.target.value) {
                            parseTemplateLinks(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a template</option>
                        {templates && templates.length > 0 ? (
                          templates.map((template) => (
                            <option key={template.id} value={template.id.toString()}>
                              {template.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No templates available</option>
                        )}
                      </select>
                      {(!templates || templates.length === 0) && (
                        <p className="text-sm text-orange-600 mt-1">
                          No templates found. Please create templates first.
                        </p>
                      )}
                    </div>
                  )}

                  {selectedNode.data.actionType === 'create_task' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Task Title
                        </label>
                        <input
                          type="text"
                          value={selectedNode.data.taskTitle || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { taskTitle: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter task title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Task Platform
                        </label>
                        <select
                          value={selectedNode.data.taskPlatform || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { taskPlatform: e.target.value as FlowNodeData['taskPlatform'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select platform</option>
                          <option value="jira">Jira</option>
                          <option value="linear">Linear</option>
                          <option value="trello">Trello</option>
                          <option value="github">GitHub</option>
                          <option value="clickup">ClickUp</option>
                        </select>
                      </div>
                    </div>
                  )}

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

              {/* END NODE PROPERTIES */}
              {selectedNode.type === 'end' && (
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

              {/* Delete button for all node types */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
