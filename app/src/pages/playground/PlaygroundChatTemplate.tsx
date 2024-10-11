import React, { PropsWithChildren } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { css } from "@emotion/react";

import {
  Button,
  Card,
  Flex,
  Icon,
  Icons,
  TextArea,
  View,
} from "@arizeai/components";

import { DragHandle } from "@phoenix/components/dnd/DragHandle";
import { usePlaygroundContext } from "@phoenix/contexts/PlaygroundContext";
import { useChatMessageStyles } from "@phoenix/hooks/useChatMessageStyles";
import {
  ChatMessage,
  ChatMessageRole,
  generateMessageId,
  PlaygroundChatTemplate as PlaygroundChatTemplateType,
} from "@phoenix/store";

import { MessageRolePicker } from "./MessageRolePicker";
import { PlaygroundInstanceProps } from "./types";

const MESSAGE_Z_INDEX = 1;
/**
 * The z-index of the dragging message.
 * Must be higher than the z-index of the other messages. Otherwise when dragging
 * from top to bottom, the dragging message will be covered by the message below.
 */
const DRAGGING_MESSAGE_Z_INDEX = MESSAGE_Z_INDEX + 1;

interface PlaygroundChatTemplateProps extends PlaygroundInstanceProps {}

export function PlaygroundChatTemplate(props: PlaygroundChatTemplateProps) {
  const id = props.playgroundInstanceId;

  const instances = usePlaygroundContext((state) => state.instances);
  const updateInstance = usePlaygroundContext((state) => state.updateInstance);
  const playgroundInstance = instances.find((instance) => instance.id === id);
  if (!playgroundInstance) {
    throw new Error(`Playground instance ${id} not found`);
  }
  const { template } = playgroundInstance;
  if (template.__type !== "chat") {
    throw new Error(`Invalid template type ${template.__type}`);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) {
          return;
        }
        const activeIndex = template.messages.findIndex(
          (message) => message.id === active.id
        );
        const overIndex = template.messages.findIndex(
          (message) => message.id === over.id
        );
        const newMessages = arrayMove(
          template.messages,
          activeIndex,
          overIndex
        );
        updateInstance({
          instanceId: id,
          patch: {
            template: {
              __type: "chat",
              messages: newMessages,
            },
          },
        });
      }}
    >
      <SortableContext items={template.messages}>
        <ul
          css={css`
            display: flex;
            flex-direction: column;
            gap: var(--ac-global-dimension-size-200);
            padding: var(--ac-global-dimension-size-200);
          `}
        >
          {template.messages.map((message, index) => {
            return (
              <SortableMessageItem
                playgroundInstanceId={id}
                template={template}
                key={message.id}
                message={message}
                index={index}
              />
            );
          })}
        </ul>
      </SortableContext>
      <View
        paddingStart="size-200"
        paddingEnd="size-200"
        paddingTop="size-100"
        paddingBottom="size-100"
        borderTopColor="dark"
        borderTopWidth="thin"
      >
        <Flex direction="row" justifyContent="end">
          <Button
            variant="default"
            aria-label="add message"
            size="compact"
            icon={<Icon svg={<Icons.PlusOutline />} />}
            onClick={() => {
              updateInstance({
                instanceId: id,
                patch: {
                  template: {
                    __type: "chat",
                    messages: [
                      ...template.messages,
                      {
                        id: generateMessageId(),
                        role: ChatMessageRole.user,
                        content: "",
                      },
                    ],
                  },
                },
              });
            }}
          >
            Message
          </Button>
        </Flex>
      </View>
    </DndContext>
  );
}

function SortableMessageItem({
  playgroundInstanceId,
  template,
  message,
}: PropsWithChildren<
  PlaygroundInstanceProps & {
    template: PlaygroundChatTemplateType;
    message: ChatMessage;
    index: number;
  }
>) {
  const updateInstance = usePlaygroundContext((state) => state.updateInstance);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({
    id: message.id,
  });

  const messageCardStyles = useChatMessageStyles(message.role);
  const dragAndDropLiStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? DRAGGING_MESSAGE_Z_INDEX : MESSAGE_Z_INDEX,
  };

  return (
    <li ref={setNodeRef} style={dragAndDropLiStyles}>
      <Card
        variant="compact"
        bodyStyle={{ padding: 0 }}
        {...messageCardStyles}
        title={
          <MessageRolePicker
            includeLabel={false}
            role={message.role}
            onChange={(role) => {
              updateInstance({
                instanceId: playgroundInstanceId,
                patch: {
                  template: {
                    __type: "chat",
                    messages: template.messages.map((msg) =>
                      msg.id === message.id ? { ...msg, role } : msg
                    ),
                  },
                },
              });
            }}
          />
        }
        extra={
          <Flex direction="row" gap="size-100">
            <Button
              aria-label="Delete message"
              icon={<Icon svg={<Icons.TrashOutline />} />}
              variant="default"
              size="compact"
              onClick={() => {
                updateInstance({
                  instanceId: playgroundInstanceId,
                  patch: {
                    template: {
                      __type: "chat",
                      messages: template.messages.filter(
                        (msg) => msg.id !== message.id
                      ),
                    },
                  },
                });
              }}
            />
            <DragHandle
              ref={setActivatorNodeRef}
              listeners={listeners}
              attributes={attributes}
            />
          </Flex>
        }
      >
        <div
          css={css`
            // TODO: remove these styles once the codemiror editor is added
            .ac-textfield {
              border: none !important;
              border-radius: 0;
              textarea {
                padding: var(--ac-global-dimension-size-200);
              }
            }
          `}
          onKeyDownCapture={(e) => {
            // Don't bubble up any keyboard events from the text area as to not interfere with DND
            e.stopPropagation();
          }}
        >
          <TextArea
            value={message.content}
            height={200}
            variant="quiet"
            aria-label={"Message content"}
            onChange={(val) => {
              updateInstance({
                instanceId: playgroundInstanceId,
                patch: {
                  template: {
                    __type: "chat",
                    messages: template.messages.map((msg) =>
                      msg.id === message.id ? { ...msg, content: val } : msg
                    ),
                  },
                },
              });
            }}
          />
        </div>
      </Card>
    </li>
  );
}