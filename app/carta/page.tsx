"use client"

import "../globals.css"
import "./print-styles.css"
import { Download, Printer } from "lucide-react"

export default function CartaPage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="carta-container cobra-snake-bg">
      {/* Botones de acción - solo visibles en pantalla */}
      <div className="print-actions">
        <button onClick={handlePrint} className="print-button">
          <Download className="w-5 h-5" />
          <span>Descargar PDF</span>
        </button>
        <button onClick={handlePrint} className="print-button secondary">
          <Printer className="w-5 h-5" />
          <span>Imprimir</span>
        </button>
      </div>
      {/* HOJA 1 */}
      <div className="a4-page">
        {/* Header con logo centrado y sponsors a los lados */}
        <header className="carta-header-centered">
          {/* Logos izquierda */}
          <div className="sponsors-logos-left">
            <img src="/Logo Fernet.png" alt="Fernet Branca" className="sponsor-logo-small" />
            <img src="/Chandon Logo.png" alt="Chandon" className="sponsor-logo-small" />
            <img src="/Carpano_Logos_BLANCO-2 (5).png" alt="Carpano" className="sponsor-logo-small" />
            <img src="/Patagonia Logo.png" alt="Patagonia" className="sponsor-logo-small remove-background" />
            <img src="/logo-Johnnie-Walker.png" alt="Johnnie Walker" className="sponsor-logo-small" />
            <img src="/Tanqueray-Logo.png" alt="Tanqueray" className="sponsor-logo-small" />
          </div>

          {/* Logo central */}
          <div className="header-center">
            <img
              src="/Logo cobra NEGRO.png"
              alt="Logo Cobra"
              className="carta-logo-center"
            />
            <h1 className="carta-main-title bebas-title">Menú</h1>
          </div>

          {/* Logos derecha */}
          <div className="sponsors-logos-right">
            <img src="/SERNOVA-Logotipo-Black-NTB433.png" alt="Sernova" className="sponsor-logo-small" />
            <img src="/Gordons-Gin-Logo.png" alt="Gordon's" className="sponsor-logo-small" />
            <img src="https://logos-world.net/wp-content/uploads/2020/11/Red-Bull-Logo.png" alt="Red Bull" className="sponsor-logo-small" />
            <img src="/Puerto blest logo.png" alt="Puerto Blest" className="sponsor-logo-small" />
            <img src="/Terrazas de los andes logo.png" alt="Terrazas de los Andes" className="sponsor-logo-small remove-background" />
          </div>
        </header>

        {/* Contenido en 2 columnas */}
        <div className="carta-columns">
          {/* COLUMNA IZQUIERDA */}
          <div className="carta-column">
            {/* TAPEOS */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Tapeos</h2>
              <div className="carta-divider"></div>

              <div className="carta-item">
                <h3 className="bebas-title">Boniatos asados</h3>
                <p className="carta-description">Con dressing de yogurt y hierbas.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Papas fritas</h3>
                <p className="carta-description">Con mezcla de especias y queso parmesano.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Papas fritas</h3>
                <p className="carta-description">Con mezcla de especias y alioli.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Papas Cobra</h3>
                <p className="carta-description">Con cheddar, bacon y verdeo.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Croquetas de jamón crudo</h3>
                <p className="carta-description">Con alioli de albahaca.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Croquetas de hongos</h3>
                <p className="carta-description">Con salsa teriyaki y romesco.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Burrata</h3>
                <p className="carta-description">Con jamón crudo, tostadas y manteca cítrica.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Rabas</h3>
                <p className="carta-description">Con salsa ranch.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Langostinos</h3>
                <p className="carta-description">Con sweet chili.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Empanadas de carne</h3>
                <p className="carta-description">Dos unidades fritas, con salsa yasgua.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Chicken crispy</h3>
                <p className="carta-description">Con pico de gallo y yasgua.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Bastones de muzzarella</h3>
                <p className="carta-description">Con salsa de tomate.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Buñuelos de acelga</h3>
                <p className="carta-description">Con alioli de morrón.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Provoleta</h3>
                <p className="carta-description">Con pesto y morrones asados en conserva.</p>
              </div>
            </section>

            {/* HAMBURGUESAS */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Hamburguesas</h2>
              <div className="carta-divider"></div>

              <div className="carta-item">
                <h3 className="bebas-title">Sweet Island</h3>
                <p className="carta-description">Con honey bacon y salsa mil islas.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Double Quarter</h3>
                <p className="carta-description">Con salsa estilo doble cuarto de libra.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Provo Cobra</h3>
                <p className="carta-description">Con provoleta y morrones en conserva.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Vegan</h3>
                <p className="carta-description">Pan de remolacha, medallón de lentejas, lechuga, tomate y ketchup de remolacha.</p>
              </div>
            </section>

            {/* ENSALADAS */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Ensaladas</h2>
              <div className="carta-divider"></div>

              <div className="carta-item">
                <h3 className="bebas-title">Caesar Salad</h3>
                <p className="carta-description">Lechuga, pollo grillado, crutones, parmesano y aderezo Caesar.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Spinach Salad</h3>
                <p className="carta-description">Espinacas, cherry, praliné de nueces, honey bacon, queso azul y vinagreta de frambuesas.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Vegan Salad</h3>
                <p className="carta-description">Mix de verdes, cherry, hongos asados, pickle de cebolla morada y pepino, palta y vinagreta de limón con semillas.</p>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="carta-column">
            {/* PARRILLA */}
            <section className="carta-category">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h2 className="carta-category-title bebas-title" style={{ marginBottom: '0' }}>Parrilla</h2>
                <span style={{ fontSize: '0.85em', fontStyle: 'italic', color: '#666', fontWeight: '300' }}>Hasta las 16.00</span>
              </div>
              <div className="carta-divider"></div>

              <div className="carta-item">
                <h3 className="bebas-title">Entraña</h3>
                <p className="carta-description">250 g</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Ojo de bife</h3>
                <p className="carta-description">350 g</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Tira de asado</h3>
                <p className="carta-description">320 g</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Pollo grillado</h3>
                <p className="carta-description">Pechuga.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Chorizo bombón</h3>
                <p className="carta-description">Dos unidades.</p>
              </div>

              <p style={{ fontSize: '0.85em', fontStyle: 'italic', color: '#666', fontWeight: '300', marginTop: '12px', marginBottom: '0' }}>Pedí tu guarnición aparte</p>
            </section>

            {/* GUARNICIONES */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Guarniciones</h2>
              <div className="carta-divider"></div>

              <div className="carta-item">
                <h3 className="bebas-title">Ensalada de verdes</h3>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Papas fritas</h3>
                <p className="carta-description">Con mezcla de especias.</p>
              </div>
            </section>

            {/* MILANESAS */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Milanesas</h2>
              <p style={{ fontSize: '0.85em', fontStyle: 'italic', color: '#666', fontWeight: '300', marginTop: '4px', marginBottom: '8px' }}> Todas salen con papas fritas y mix de verdes</p>
              <div className="carta-divider"></div>

              <div className="carta-item">
                <h3 className="bebas-title">Clásica</h3>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Americana</h3>
                <p className="carta-description">Con cheddar y panceta.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Caprese</h3>
                <p className="carta-description">Con muzzarella, cherry y pesto.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Napolitana</h3>
                <p className="carta-description">Con salsa de tomate, muzzarella, jamón y orégano.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Francesa</h3>
                <p className="carta-description">Con queso azul y cebolla caramelizada.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Mexicana</h3>
                <p className="carta-description">Con guacamole y muzzarella.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Suiza</h3>
                <p className="carta-description">Con muzzarella, provoleta y parmesano.</p>
              </div>
            </section>

            {/* PRINCIPALES */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Principales</h2>
              <div className="carta-divider"></div>

              <div className="carta-item">
                <h3 className="bebas-title">Ojo de bife</h3>
                <p className="carta-description">Con ensalada de verdes y papas fritas.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Pollo grillado</h3>
                <p className="carta-description">Con ensalada de verdes y papas fritas.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Burritos</h3>
                <p className="carta-description">De bondiola desmenuzada con guacamole y muzzarella. Con papas fritas.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Ciabatta de hongos</h3>
                <p className="carta-description">Girgolas asadas, rucula, pickle de cebolla morada y alioli de berenjena. Con papas fritas.</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* HOJA 2 */}
      <div className="a4-page">
        {/* Header con logo centrado - igual que hoja 1 */}
        <header className="carta-header-centered">
          {/* Logos izquierda */}
          <div className="sponsors-logos-left">
            <img src="/Logo Fernet.png" alt="Fernet Branca" className="sponsor-logo-small" />
            <img src="/Chandon Logo.png" alt="Chandon" className="sponsor-logo-small" />
            <img src="/Carpano_Logos_BLANCO-2 (5).png" alt="Carpano" className="sponsor-logo-small" />
            <img src="/Patagonia Logo.png" alt="Patagonia" className="sponsor-logo-small remove-background" />
            <img src="/logo-Johnnie-Walker.png" alt="Johnnie Walker" className="sponsor-logo-small" />
            <img src="/Tanqueray-Logo.png" alt="Tanqueray" className="sponsor-logo-small" />
          </div>

          {/* Logo central */}
          <div className="header-center">
            <img
              src="/Logo cobra NEGRO.png"
              alt="Logo Cobra"
              className="carta-logo-center"
            />
          </div>

          {/* Logos derecha */}
          <div className="sponsors-logos-right">
            <img src="/SERNOVA-Logotipo-Black-NTB433.png" alt="Sernova" className="sponsor-logo-small" />
            <img src="/Gordons-Gin-Logo.png" alt="Gordon's" className="sponsor-logo-small" />
            <img src="https://logos-world.net/wp-content/uploads/2020/11/Red-Bull-Logo.png" alt="Red Bull" className="sponsor-logo-small" />
            <img src="/Puerto blest logo.png" alt="Puerto Blest" className="sponsor-logo-small" />
            <img src="/Terrazas de los andes logo.png" alt="Terrazas de los Andes" className="sponsor-logo-small remove-background" />
          </div>
        </header>

        {/* Contenido en 2 columnas */}
        <div className="carta-columns">
          {/* COLUMNA IZQUIERDA */}
          <div className="carta-column">
            {/* CAFETERÍA */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Cafetería</h2>
              <div className="carta-divider"></div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Espresso</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Doble espresso</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Café americano</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Flat White</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Cappuccino</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Moccaccino</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Latte</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Caramel Latte</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Vainilla Latte</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Latte de avellanas</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Espresso tonic</h3>
              </div>
            </section>

            {/* PASTELERÍA */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Pastelería</h2>
              <div className="carta-divider"></div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Budín de limón</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Budín de banana y chocolate</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Cookie de chocolate y vainilla</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Cookie del día</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Medialunas</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Torta del fin de semana</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Brownie</h3>
              </div>
            </section>

            {/* POSTRES */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Postres</h2>
              <div className="carta-divider"></div>

              <div className="carta-item">
                <h3 className="bebas-title">Brownie</h3>
                <p className="carta-description">Con helado, salsa de dulce de leche y praliné de nuez.</p>
              </div>

              <div className="carta-item">
                <h3 className="bebas-title">Cheesecake</h3>
                <p className="carta-description">Estilo new york con frutos rojos.</p>
              </div>
            </section>

            {/* PROMOCIONES */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Promociones</h2>
              <div className="carta-divider"></div>

              {/* CAFE */}
              <div className="carta-subcategory">
                <h4 className="bebas-title">CAFE</h4>
                <div className="carta-item-simple">
                  <h3 className="bebas-title">1 AMERICANO O CAPUCCINO + 2 MEDIALUNAS</h3>
                </div>
                <div className="carta-item-simple">
                  <h3 className="bebas-title">1 CAFE A ELECCION + CHIPA</h3>
                </div>
                <div className="carta-item-simple">
                  <h3 className="bebas-title">1 FLAT WHITE O LATTE + 1 BUDIN DE LIMON O BANANA</h3>
                </div>
                <div className="carta-item-simple">
                  <h3 className="bebas-title">2 CAFES A ELECCION + BROWNIE + COOKIE</h3>
                </div>
              </div>

              {/* TAPEOS */}
              <div className="carta-subcategory">
                <h4 className="bebas-title">TAPEOS</h4>
                <div className="carta-item-simple">
                  <h3 className="bebas-title">PAPAS FRITAS + 2 CORONAS</h3>
                </div>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="carta-column">
            {/* BEBIDAS */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Bebidas</h2>
              <div className="carta-divider"></div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Agua sin gas</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Agua con gas</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Coca-Cola</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Sprite</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Fanta</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Red Bull</h3>
              </div>
            </section>

            {/* LICUADOS Y JUGOS */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Licuados y jugos</h2>
              <div className="carta-divider"></div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Limonada</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Pomelada</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Jugo de naranja</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Licuado de banana</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Licuado de frutilla y naranja</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Detox del día</h3>
              </div>
            </section>

            {/* CERVEZAS */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Cervezas</h2>
              <div className="carta-divider"></div>

              <div className="carta-subcategory">
                <h4 className="bebas-title">Tiradas</h4>
                <p>Línea Patagonia</p>
                <p>Stella Artois</p>
              </div>

              <div className="carta-subcategory">
                <h4 className="bebas-title">Porrones</h4>
                <p>Stella Artois</p>
                <p>Corona</p>
              </div>

              <div className="carta-subcategory">
                <h4 className="bebas-title">Sin alcohol</h4>
                <p>Stella Artois</p>
              </div>
            </section>

            {/* TRAGOS */}
            <section className="carta-category">
              <h2 className="carta-category-title bebas-title">Tragos clásicos</h2>
              <div className="carta-divider"></div>


              <div className="carta-item-simple">
                <h3 className="bebas-title">Fernet con Coca-Cola</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Vodka con Red Bull</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Caipiroska</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Aperol Spritz</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Mojito</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Negroni</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Penicillin</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Tanqueray Tonic</h3>
              </div>

              <div className="carta-item-simple">
                <h3 className="bebas-title">Jarra de tinto de verano</h3>
              </div>
            </section>

            {/* Texto antes del QR */}
            <div style={{ textAlign: 'center', marginBottom: 0, marginTop: '4px' }}>
              <p style={{ fontSize: '0.9em', fontStyle: 'italic', color: '#666', fontWeight: 300, marginBottom: 0 }}>Escaneando este QR podés ver nuestros tragos de autor</p>
            </div>

            {/* QR CODE */}
            <div className="carta-qr-container">
              <img
                src="/qr-cobra.png"
                alt="QR Code Cobra"
                className="carta-qr-image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

