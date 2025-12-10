import { useEffect, useState } from 'react';
import productService from '../services/productService';
import { useNavigate } from 'react-router-dom';
import { X, Save, Plus, AlertCircle, CheckCircle } from 'lucide-react';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await productService.getAll();
    setProducts(data);
  };

  // Actualizar previsualización de imagen
  const handleImageChange = (e) => {
    const url = e.target.value;
    setFormData({...formData, imagen_url: url});
    setImagePreview(url);
  };

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- MANEJO DEL FORMULARIO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.precio) {
      showNotification('Por favor completa los campos obligatorios', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        showNotification('✅ Producto actualizado correctamente', 'success');
      } else {
        await productService.create(formData);
        showNotification('✅ Producto creado correctamente', 'success');
      }
      setEditingProduct(null);
      setFormData({ nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: '' });
      setImagePreview('');
      loadProducts();
    } catch (error) {
      showNotification('❌ Error al guardar. Verifica que seas Admin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      categoria_id: product.categoria_id,
      imagen_url: product.imagen_url
    });
    setImagePreview(product.imagen_url);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({ nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: '' });
    setImagePreview('');
  };

  // --- ACCIONES RÁPIDAS ---
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await productService.delete(id);
      showNotification('✅ Producto eliminado', 'success');
      loadProducts();
    } catch (error) {
      showNotification('❌ Error al eliminar', 'error');
    }
  };

  const toggleAvailability = async (product) => {
    try {
      await productService.update(product.id, { disponible: !product.disponible });
      showNotification(`Stock ${!product.disponible ? 'activado' : 'desactivado'}`, 'success');
      loadProducts();
    } catch (error) {
      console.error(error);
      showNotification('❌ No se pudo cambiar el estado', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      padding: '40px 20px',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* NOTIFICACIÓN */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 20px',
          background: notification.type === 'success' ? '#27ae60' : '#e74c3c',
          color: 'white',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .input-field {
          background: #2a2a2a;
          border: 2px solid #3a3a3a;
          color: #e0e0e0;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
          background: #2a2a2a;
        }
        
        .input-field::placeholder {
          color: #888;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
          color: #1a1a1a;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
        }
        
        .btn-primary:active {
          transform: translateY(0);
        }
        
        .btn-secondary {
          background: #444;
          color: #e0e0e0;
          border: 2px solid #555;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .btn-secondary:hover {
          background: #555;
          border-color: #666;
        }
      `}</style>

      {/* CONTENEDOR PRINCIPAL */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', color: '#d4af37', marginBottom: '8px', fontWeight: 700 }}>
            🛠️ Panel de Administración
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Gestiona el menú de crepas</p>
        </div>

        {/* GRID DE DOS COLUMNAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #1e1e1e 0%, #252525 100%)',
              border: '2px solid #2a2a2a',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              position: 'sticky',
              top: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                color: editingProduct ? '#ff9800' : '#d4af37',
                marginBottom: '24px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Nombre */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                    Nombre del Producto *
                  </label>
                  <input
                    className="input-field"
                    placeholder="Ej: Crepa Nutella"
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>

                {/* Precio */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                    Precio ($) *
                  </label>
                  <input
                    className="input-field"
                    placeholder="150"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={e => setFormData({...formData, precio: e.target.value})}
                    required
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                    Categoría
                  </label>
                  <select
                    className="input-field"
                    value={formData.categoria_id}
                    onChange={e => setFormData({...formData, categoria_id: e.target.value})}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="1">🍫 Dulces</option>
                    <option value="2">🧀 Saladas</option>
                    <option value="3">🍰 Postres</option>
                    <option value="4">🥤 Bebidas</option>
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                    Descripción
                  </label>
                  <textarea
                    className="input-field"
                    placeholder="Describe tu crepa aquí..."
                    value={formData.descripcion}
                    onChange={e => setFormData({...formData, descripcion: e.target.value})}
                    rows="3"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* URL Imagen */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                    URL de Imagen
                  </label>
                  <input
                    className="input-field"
                    placeholder="https://..."
                    value={formData.imagen_url}
                    onChange={handleImageChange}
                  />
                </div>

                {/* BOTONES */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    <Save size={18} />
                    {loading ? 'Guardando...' : editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={cancelEdit} className="btn-secondary">
                      <X size={18} />
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA: PREVISUALIZACIÓN */}
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #1e1e1e 0%, #252525 100%)',
              border: '2px solid #2a2a2a',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '16px',
                color: '#d4af37',
                marginBottom: '20px',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                👁️ Previsualización
              </h2>

              {imagePreview ? (
                <>
                  <div style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    border: '2px solid #3a3a3a',
                    background: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '10px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<p style="color: #888;">❌ Imagen no válida</p>';
                      }}
                    />
                  </div>

                  <div style={{
                    background: '#2a2a2a',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #3a3a3a'
                  }}>
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Nombre</p>
                      <p style={{ color: '#d4af37', fontSize: '18px', fontWeight: 600 }}>
                        {formData.nombre || 'Tu crepa aquí'}
                      </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Precio</p>
                      <p style={{ color: '#27ae60', fontSize: '24px', fontWeight: 700 }}>
                        ${formData.precio || '0.00'}
                      </p>
                    </div>

                    <div>
                      <p style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Descripción</p>
                      <p style={{ color: '#bbb', fontSize: '13px', lineHeight: '1.5' }}>
                        {formData.descripcion || 'Descripción de tu crepa'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  height: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#2a2a2a',
                  borderRadius: '12px',
                  border: '2px dashed #3a3a3a'
                }}>
                  <p style={{ color: '#888', fontSize: '48px', marginBottom: '10px' }}>🖼️</p>
                  <p style={{ color: '#888', fontSize: '14px' }}>Agrega una URL de imagen</p>
                  <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>para ver la previsualización aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1e1e 0%, #252525 100%)',
          border: '2px solid #2a2a2a',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ padding: '30px', borderBottom: '2px solid #2a2a2a' }}>
            <h2 style={{
              fontSize: '20px',
              color: '#d4af37',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📋 Productos ({products.length})
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2a2a2a', borderBottom: '2px solid #3a3a3a' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Imagen</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Nombre</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Precio</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Stock</th>
                  <th style={{ padding: '16px', textAlign: 'center', color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #2a2a2a',
                      transition: 'background 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#242424'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <img
                        src={p.imagen_url}
                        alt={p.nombre}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #3a3a3a'
                        }}
                      />
                    </td>
                    <td style={{ padding: '16px', color: '#e0e0e0', fontWeight: 500 }}>{p.nombre}</td>
                    <td style={{ padding: '16px', color: '#27ae60', fontWeight: 600 }}>${p.precio}</td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => toggleAvailability(p)}
                        style={{
                          padding: '6px 14px',
                          background: p.disponible ? '#27ae60' : '#c0392b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                          transition: 'all 0.3s ease',
                          boxShadow: p.disponible ? '0 4px 12px rgba(39, 174, 96, 0.3)' : '0 4px 12px rgba(192, 57, 43, 0.3)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        {p.disponible ? '🟢 ACTIVO' : '🔴 AGOTADO'}
                      </button>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => startEdit(p)}
                          style={{
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fb8c00';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ff9800';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#c0392b';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#e74c3c';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#888'
            }}>
              <p style={{ fontSize: '18px' }}>📭 No hay productos aún</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Crea el primero usando el formulario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;