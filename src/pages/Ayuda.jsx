// src/pages/Ayuda.jsx
import React from "react";
import "../styles/ayuda.css";

export default function Ayuda() {
  return (
    <div className="ayuda-container">
      <div className="ayuda-hero">
        <h1>Centro de Ayuda</h1>
        <p>Aprende cómo usar MecaShop de manera fácil y rápida</p>
      </div>

      <div className="ayuda-content">
        {/* Sección: Primeros Pasos */}
        <section className="ayuda-section">
          <h2>Primeros Pasos</h2>
          <div className="ayuda-card">
            <h3>¿Cómo crear una cuenta?</h3>
            <ol>
              <li>Haz clic en "Login" en el menú superior</li>
              <li>Selecciona "¿No tienes cuenta? comunicate a este correo soporte@mecashop.com"</li>
              <li>Completa el formulario con tus datos</li>
              <li>Verifica tu correo electrónico</li>
              <li>¡Listo! Ya puedes iniciar sesión</li>
            </ol>
          </div>

          <div className="ayuda-card">
            <h3>¿Cómo iniciar sesión?</h3>
            <ol>
              <li>Haz clic en "Login" en el menú</li>
              <li>Ingresa tu correo y contraseña</li>
              <li>Haz clic en "Iniciar Sesión"</li>
            </ol>
          </div>
        </section>

        {/* Sección: Comprar Productos */}
        <section className="ayuda-section">
          <h2>Comprar Productos</h2>
          <div className="ayuda-card">
            <h3>¿Cómo comprar un producto?</h3>
            <ol>
              <li>Navega por el catálogo en la página de inicio</li>
              <li>Haz clic en el producto que te interesa</li>
              <li>Revisa la descripción y el precio</li>
              <li>Haz clic en "Agregar al Carrito"</li>
              <li>Ve a tu carrito y confirma tu pedido</li>
              <li>Completa el pago con PayPal</li>
            </ol>
          </div>

          <div className="ayuda-card">
            <h3>¿Cómo ver mis órdenes?</h3>
            <p>Una vez logueado como cliente, ve a "Perfil" y luego selecciona "Mis Órdenes" para ver el historial de tus compras.</p>
          </div>
        </section>

        {/* Sección: Servicios Mecánicos */}
        <section className="ayuda-section">
          <h2>Servicios Mecánicos</h2>
          <div className="ayuda-card">
            <h3>¿Cómo solicitar una cita con un mecánico?</h3>
            <ol>
              <li>Inicia sesión como cliente</li>
              <li>Ve a "Directorio" para ver mecánicos disponibles</li>
              <li>Selecciona un mecánico y haz clic en "Solicitar Cita"</li>
              <li>Completa el formulario con los detalles del servicio</li>
              <li>Espera la confirmación del mecánico</li>
            </ol>
          </div>

          <div className="ayuda-card">
            <h3>¿Cómo ver mis citas?</h3>
            <p>En el menú superior, haz clic en "Mis Citas" para ver todas tus citas programadas, pendientes y completadas.</p>
          </div>

          <div className="ayuda-card">
            <h3>¿Cómo calificar un servicio?</h3>
            <ol>
              <li>Ve a "Calificar" en el menú</li>
              <li>Selecciona el servicio completado</li>
              <li>Asigna una calificación de 1 a 5 estrellas</li>
              <li>Escribe un comentario (opcional)</li>
              <li>Envía tu calificación</li>
            </ol>
          </div>
        </section>

        {/* Sección: Vehículos */}
        <section className="ayuda-section">
          <h2>Gestión de Vehículos</h2>
          <div className="ayuda-card">
            <h3>¿Cómo registrar mi vehículo?</h3>
            <ol>
              <li>Ve a "Mis Vehículos" en el menú</li>
              <li>Haz clic en "Agregar Vehículo"</li>
              <li>Completa los datos del vehículo (marca, modelo, año, placa)</li>
              <li>Sube una foto (opcional)</li>
              <li>Guarda los cambios</li>
            </ol>
          </div>

          <div className="ayuda-card">
            <h3>¿Cómo gestionar documentos de mi vehículo?</h3>
            <p>En "Mis Vehículos", selecciona un vehículo y haz clic en "Documentos". Puedes subir SOAT, revisión técnica y otros documentos. El sistema te alertará cuando estén próximos a vencer.</p>
          </div>
        </section>

        {/* Sección: Perfil */}
        <section className="ayuda-section">
          <h2>Mi Perfil</h2>
          <div className="ayuda-card">
            <h3>¿Cómo editar mi perfil?</h3>
            <ol>
              <li>Ve a "Perfil" en el menú</li>
              <li>Haz clic en "Editar Información"</li>
              <li>Actualiza tus datos (nombre, teléfono, zona)</li>
              <li>Cambia tu foto de perfil si lo deseas</li>
              <li>Guarda los cambios</li>
            </ol>
          </div>

          <div className="ayuda-card">
            <h3>¿Cómo cambiar mi contraseña?</h3>
            <p>En la página de login, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones para recuperarla por correo electrónico.</p>
          </div>
        </section>

        {/* Sección: Roles */}
        <section className="ayuda-section">
          <h2>Tipos de Cuenta</h2>
          <div className="ayuda-card">
            <h3>Cliente</h3>
            <p>Puedes comprar productos, solicitar citas con mecánicos, gestionar tus vehículos y calificar servicios.</p>
          </div>

          <div className="ayuda-card">
            <h3>Mecánico</h3>
            <p>Puedes ofrecer tus servicios, gestionar citas con clientes y recibir calificaciones.</p>
          </div>

          <div className="ayuda-card">
            <h3>Tienda</h3>
            <p>Puedes gestionar tu catálogo de productos, ver calificaciones de productos y administrar mecánicos.</p>
          </div>
        </section>

        {/* Sección: Contacto */}
        <section className="ayuda-section">
          <h2>¿Necesitas registrarte o más ayuda?</h2>
          
          <div className="ayuda-card">
            <h3>Solicitar Acceso a la Plataforma</h3>
            <p>Si aún no tienes una cuenta y deseas registrarte en MecaShop, envía un correo al administrador con tus datos:</p>
            <ul>
              <li><strong>Email del administrador:</strong> soporte@mecashop.com</li>
              <li><strong>Incluye en tu mensaje:</strong> Nombre completo, correo electrónico, teléfono y tipo de cuenta que necesitas (Cliente, Mecánico o Tienda)</li>
            </ul>
            <p>El administrador revisará tu solicitud y te creará una cuenta con acceso a la plataforma.</p>
          </div>

          <div className="ayuda-card">
            <h3>Contacta con soporte</h3>
            <p>Si tienes problemas técnicos o preguntas que no están resueltas aquí, contáctanos:</p>
            <ul>
              <li>Email: soporte@mecashop.com</li>
              <li>Teléfono: Disponible en tu área</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
