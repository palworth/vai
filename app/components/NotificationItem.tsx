interface NotificationItemProps {
    title: string
    message: string
    read?: boolean
  }
  
  export default function NotificationItem({ title, message, read }: NotificationItemProps) {
    return (
      <div className="border p-3 rounded-2xl shadow bg-white flex flex-col gap-1">
        <h3 className="font-bold text-lg">{title}</h3>
        <p>{message}</p>
        {read ? (
          <span className="text-green-600 text-sm">Read</span>
        ) : (
          <span className="text-blue-600 text-sm">Unread</span>
        )}
      </div>
    )
  }
  