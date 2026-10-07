import { useState, useEffect, useRef } from 'react';

// Fallback image placeholder
const PLACEHOLDER_IMG =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23AEEED3%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2290%22%20y%3D%22105%22%20fill%3D%22%23287A74%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [image, setImage] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch all items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      let res = await fetch('/api/items');
      if (!res.ok) {
        res = await fetch('http://localhost:5000/api/items');
      }
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  // Convert selected file to Base64
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please choose an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result);
        reader.readAsDataURL(file);
      } else {
        showNotification('error', 'Please drop an image file.');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeSelectedImage = () => {
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Form Submission with Validations
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Name validation (should not have numbers)
    const trimmedName = name.trim();
    if (!trimmedName) {
      showNotification('error', 'Name is required.');
      return;
    }
    if (/\d/.test(trimmedName)) {
      showNotification('error', 'Name should not contain numbers.');
      return;
    }

    // 2. Description validation
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      showNotification('error', 'Description is required.');
      return;
    }

    // 3. Contact validation (must be either email or phone number in one textbox)
    const trimmedContact = contact.trim();
    if (!trimmedContact) {
      showNotification('error', 'Contact info is required.');
      return;
    }

    if (trimmedContact.includes('@')) {
      // Email validation: must have @ and .
      if (!trimmedContact.includes('.')) {
        showNotification('error', "Email must contain '@' and '.'.");
        return;
      }
    } else if (/^\d+$/.test(trimmedContact)) {
      // Phone number validation: cannot be more than 10 numbers
      if (trimmedContact.length > 10) {
        showNotification('error', 'Phone number cannot be more than 10 numbers.');
        return;
      }
    } else {
      // Input is neither valid phone number nor has @
      if (/[a-zA-Z]/.test(trimmedContact)) {
        showNotification('error', "Email must contain '@' and '.'.");
      } else {
        showNotification('error', 'Phone number cannot be more than 10 numbers.');
      }
      return;
    }

    // 4. Image validation
    if (!image.trim()) {
      showNotification('error', 'Please select or enter an image.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: trimmedName,
        name: trimmedName,
        description: trimmedDescription,
        location: location.trim() || 'Not specified',
        contact: trimmedContact,
        image: image.trim(),
      };

      let res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch('http://localhost:5000/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save item');
      }

      const createdItem = await res.json();
      setItems((prev) => [createdItem, ...prev]);

      // Reset form
      setName('');
      setDescription('');
      setLocation('');
      setContact('');
      setImage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showNotification('success', 'Lost item posted successfully.');
    } catch (err) {
      console.error(err);
      showNotification('error', err.message || 'Could not post item. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Mark item as Found (Deletes item and removes the card div)
  const handleMarkAsFound = async (id) => {
    try {
      let res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        res = await fetch(`http://localhost:5000/api/items/${id}`, {
          method: 'DELETE',
        });
      }

      if (!res.ok) {
        throw new Error('Failed to delete item');
      }

      // Immediately removes the image/item div from the UI
      setItems((prev) => prev.filter((item) => item._id !== id));
      showNotification('success', 'Item marked as found and removed.');
    } catch (err) {
      console.error(err);
      showNotification('error', 'Could not remove item.');
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Format image url for local files
  const getImageSource = (img) => {
    if (!img) return PLACEHOLDER_IMG;
    if (img.startsWith('/uploads/')) {
      return `http://localhost:5000${img}`;
    }
    return img;
  };

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <h1 className="brand-title">Lost and Found</h1>
          <p className="brand-subtitle">Add lost items or click Found to remove them</p>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-container">
        {/* Form Panel */}
        <section className="form-panel">
          <div className="panel-header">
            <h2 className="panel-title">Add Lost Item</h2>
          </div>

          <form className="item-form" onSubmit={handleSubmit}>
            {message && (
              <div
                className={`alert-box ${
                  message.type === 'success' ? 'alert-success' : 'alert-error'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Name Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Name *
              </label>
              <input
                id="name"
                className="form-input"
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Location Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className="form-input"
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Contact Input (Single textbox for Email or Phone Number) */}
            <div className="form-group">
              <label className="form-label" htmlFor="contact">
                Contact *
              </label>
              <input
                id="contact"
                className="form-input"
                type="text"
                placeholder="Enter email or phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>

            {/* Photo Input */}
            <div className="form-group">
              <label className="form-label">Photo *</label>

              {image ? (
                <div className="image-preview-box">
                  <img src={getImageSource(image)} alt="Preview" />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={removeSelectedImage}
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <>
                  {!showUrlInput ? (
                    <div
                      className="upload-dropzone"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <div className="upload-text">Click to choose image or drag and drop</div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Enter image URL"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  )}

                  <button
                    type="button"
                    className="toggle-link"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    {showUrlInput ? 'Choose file instead' : 'Or enter image URL'}
                  </button>
                </>
              )}
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Posting...' : 'Post Item'}
            </button>
          </form>
        </section>

        {/* Items List */}
        <section>
          <div className="feed-header">
            <h2 className="feed-title">Lost Items</h2>
            <div className="feed-count">{items.length} Items</div>
          </div>

          {loading ? (
            <div className="loading-box">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="empty-box">No lost items right now.</div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item._id} className="item-card">
                  <img
                    src={getImageSource(item.image)}
                    alt={item.name || item.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMG;
                    }}
                  />

                  <div className="card-content">
                    <h3 className="item-title">{item.name || item.title}</h3>
                    <p className="item-desc">{item.description}</p>

                    <div className="item-info">
                      {item.location && item.location !== 'Not specified' && (
                        <div>Location: {item.location}</div>
                      )}
                      {item.contact && item.contact !== 'Not specified' && (
                        <div>Contact: {item.contact}</div>
                      )}
                      <div className="item-date">Date: {formatDate(item.createdAt)}</div>
                    </div>
                  </div>

                  {/* Found Button that removes the card div */}
                  <button
                    className="btn-found"
                    onClick={() => handleMarkAsFound(item._id)}
                  >
                    Found
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        Lost and Found Application
      </footer>
    </div>
  );
}

export default App;
