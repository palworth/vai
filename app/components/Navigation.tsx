import Link from "next/link"

const Navigation = ({ dogId }: { dogId: string }) => {
  return (
    <nav>
      <ul>
        <li>
          <Link href={`/dashboard?dogId=${dogId}`}>Overall Dashboard</Link>
        </li>
        <li>
          <Link href={`/diet-dashboard?dogId=${dogId}`}>Diet Dashboard</Link>
        </li>
        {/* Add other navigation items here */}
      </ul>
    </nav>
  )
}

export default Navigation

