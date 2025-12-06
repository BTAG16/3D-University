import { Building2, DoorOpen, MapPin, Search, Plus, Inbox } from 'lucide-react'
import './EmptyState.css'

export const EmptyState = ({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action, 
  actionLabel,
  secondary,
  secondaryLabel 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      
      <div className="empty-state-actions">
        {action && (
          <button className="empty-state-btn primary" onClick={action}>
            <Plus size={20} />
            {actionLabel}
          </button>
        )}
        {secondary && (
          <button className="empty-state-btn secondary" onClick={secondary}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export const NoBuildingsState = ({ onAddBuilding }) => (
  <EmptyState
    icon={Building2}
    title="No Buildings Yet"
    description="Start building your campus map by adding your first building. You can add location, details, and facilities for each building."
    action={onAddBuilding}
    actionLabel="Add First Building"
  />
)

export const NoRoomsState = ({ onAddRoom, onAddBuilding, hasBuildings }) => {
  if (!hasBuildings) {
    return (
      <EmptyState
        icon={Building2}
        title="No Buildings Yet"
        description="You need to add buildings before you can add rooms. Start by creating your first building."
        action={onAddBuilding}
        actionLabel="Add First Building"
      />
    )
  }
  
  return (
    <EmptyState
      icon={DoorOpen}
      title="No Rooms Yet"
      description="Add rooms to your buildings to help students find classrooms, labs, and other facilities. You can add rooms one by one or import them in bulk."
      action={onAddRoom}
      actionLabel="Add First Room"
    />
  )
}

export const NoSearchResultsState = ({ query, onClear }) => (
  <EmptyState
    icon={Search}
    title="No Results Found"
    description={`We couldn't find anything matching "${query}". Try adjusting your search or browse all items.`}
    action={onClear}
    actionLabel="Clear Search"
  />
)

export const ErrorState = ({ error, onRetry }) => (
  <EmptyState
    icon={Inbox}
    title="Something Went Wrong"
    description={error || "We're having trouble loading this content. Please try again."}
    action={onRetry}
    actionLabel="Try Again"
  />
)
