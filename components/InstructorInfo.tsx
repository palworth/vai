interface InstructorInfoProps {
    name: string
  }
  
  export function InstructorInfo({ name }: InstructorInfoProps) {
    return (
      <div className="flex items-center gap-2">
        <span>Led by {name}</span>
      </div>
    )
  }
  
  