// AinouHook 类型定义文件

export declare namespace Ainou {
    /** 文本消息 */
    export interface TextMessage {
        type: 'text';
        /** 消息原文 */
        body: string;
    }
    /** 酷Q码消息（QQ 特有） */
    export interface CQCodeMessage {
        type: 'cqcode';
        /** 酷Q码 */
        body: string;
    }
    /** 图片消息 */
    export interface ImageMessage {
        type: 'image';
        /** 图片下载地址 */
        url: string;
        /** 图片内容 sha1 摘要后，hex 编码值 */
        sha1?: string;
        /** 图片宽度(px) */
        width?: number;
        /** 图片高度(px) */
        height?: number;
        /** 图片文件尺寸(字节) */
        bytes?: number;
    }
    /** 图文混排消息 */
    export interface MixedMessage {
        type: 'mixed';
        /** 按顺序排列的消息片 */
        pieces: Array<TextMessage | ImageMessage>;
    }
    /** 复合消息 */
    export interface AlternativeMessage {
        type: 'alternative';
        /** 若该消息可用文本方式解读，则该字段存放文本格式解读的消息。 */
        text?: TextMessage;
        /** 若该消息可用酷Q码方式解读，则该字段存放酷Q码格式解读的消息。 */
        cqcode?: CQCodeMessage;
        /** 若该消息可用图片方式解读，则该字段存放图片格式解读的消息。 */
        image?: ImageMessage;
        /** 若该消息可用图文混排方式解读，则该字段存放图文混排格式解读的消息。 */
        mixed?: MixedMessage;
    }
    /** 消息目标（发送者或接收者） */
    export interface MessageTarget {
        /** 协议 */
        protocol: string;
        /** 会话窗口 */
        session: string;
        /** 协议中的用户名 */
        user: string;
        /** Ainou 端口的协议用户名 */
        port: string;
        /** 所在频道（群） */
        channel?: string;
        /** 用户昵称 */
        user_name?: string;
        /** 用户群名片 */
        user_channel_name?: string;
        /** 频道（群）名 */
        channel_name?: string;
    }
    /** Ainou 用户 */
    export interface User {
        /** 用户 ID，唯一识别符 */
        id: string;
        /** 用户名；可能改变，无法作为唯一识别符使用 */
        username: string;
        /** 用户昵称 */
        nickname: string;
    }
    /** 接收的消息 */
    export interface MessagePayload {
        /** 消息类型 */
        type: 'command' | 'message';
        /** ainouhook token */
        token: string;
        /** 消息体 */
        message: TextMessage | CQCodeMessage | ImageMessage | MixedMessage | AlternativeMessage;
        /** 消息发送者的 Ainou 用户 */
        user: User;
        /** 消息来源 */
        source: MessageTarget;
        /** 上下文 */
        session?: object;
    }
    /** 接收的错误 */
    export interface ErrorPayload {
        type: 'error';
        /** 错误原因 */
        message: string;
    }
    /** 发出的消息 */
    export interface SendMessagePayload<T> {
        /** 消息体 */
        message: T;
        /** 接收对象 */
        recipient: MessageTarget;
        /** 上下文 */
        session: object;
        /** 是否保留上下文 */
        keepSession?: boolean;
    }
}