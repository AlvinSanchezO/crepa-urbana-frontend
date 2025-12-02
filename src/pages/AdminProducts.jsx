import { useEffect, useState } from 'react';
import productService from '../services/productService';
import { useNavigate } from 'react-router-dom';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // Si es null, estamos creando. Si tiene datos, editamos.
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await productService.getAll();
    setProducts(data);
  };

  // --- MANEJO DEL FORMULARIO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Modo Edición
        await productService.update(editingProduct.id, formData);
        alert('Producto actualizado');
      } else {
        // Modo Creación
        await productService.create(formData);
        alert('Producto creado');
      }
      setEditingProduct(null);
      setFormData({ nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: '' });
      loadProducts(); // Recargar lista
    } catch (error) {
      alert('Error al guardar. Verifica que seas Admin.');
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
  };

  // --- ACCIONES RÁPIDAS ---
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await productService.delete(id);
      loadProducts();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  // El famoso "Interruptor" de Stock
  const toggleAvailability = async (product) => {
    try {
      await productService.update(product.id, { disponible: !product.disponible });
      loadProducts(); // Recargar para ver el cambio visual
    } catch (error) {
      console.error(error);
      alert('No se pudo cambiar el estado');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Panel de Administración: Menú 🛠️</h1>
      
      {/* FORMULARIO */}
      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required style={{padding: '8px'}} />
          <input placeholder="Precio" type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} required style={{padding: '8px'}} />
          <input placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} style={{padding: '8px', gridColumn: 'span 2'}} />
          <input placeholder="URL Imagen" value={formData.imagen_url} onChange={e => setFormData({...formData, imagen_url: e.target.value})} style={{padding: '8px', gridColumn: 'span 2'}} />
          
          <select value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})} style={{padding: '8px'}}>
            <option value="1">Dulces</option>
            <option value="2">Saladas</option>
            <option value="3">Postres</option>
            <option value="4">Bebidas</option>
          </select>

          <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', background: '#2ecc71', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
            {editingProduct && (
              <button type="button" onClick={() => {setEditingProduct(null); setFormData({ nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: '' })}} style={{ padding: '10px', background: '#95a5a6', color: 'white', border: 'none', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#333', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Imagen</th>
            <th style={{ padding: '10px' }}>Nombre</th>
            <th style={{ padding: '10px' }}>Precio</th>
            <th style={{ padding: '10px' }}>Stock (Disponible)</th>
            <th style={{ padding: '10px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>
                <img src={p.imagen_url} alt="img" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              </td>
              <td style={{ padding: '10px' }}>{p.nombre}</td>
              <td style={{ padding: '10px' }}>${p.precio}</td>
              <td style={{ padding: '10px' }}>
                {/* INTERRUPTOR DE STOCK */}
                <button 
                  onClick={() => toggleAvailability(p)}
                  style={{
                    padding: '5px 10px',
                    background: p.disponible ? '#27ae60' : '#c0392b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {p.disponible ? '🟢 ACTIVO' : '🔴 AGOTADO'}
                </button>
              </td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => startEdit(p)} style={{ marginRight: '5px', padding: '5px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(p.id)} style={{ padding: '5px', cursor: 'pointer' }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProducts;