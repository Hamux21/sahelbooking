<template>
  <div v-if="show" class="notification-toast" :class="type">
    <div class="notification-content">
      <div class="notification-icon">
        <span v-if="type === 'success'">✓</span>
        <span v-else-if="type === 'error'">✗</span>
        <span v-else-if="type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </div>
      <div class="notification-message">
        <h4 v-if="title">{{ title }}</h4>
        <p>{{ message }}</p>
      </div>
      <button @click="close" class="notification-close">&times;</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationToast',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  watch: {
    show(newVal) {
      if (newVal && this.duration > 0) {
        setTimeout(() => {
          this.close()
        }, this.duration)
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  min-width: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.notification-message {
  flex: 1;
}

.notification-message h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.notification-message p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

/* Types de notifications */
.notification-toast.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.notification-toast.success .notification-icon {
  background-color: #28a745;
  color: white;
}

.notification-toast.success .notification-close:hover {
  background-color: rgba(40, 167, 69, 0.1);
}

.notification-toast.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.notification-toast.error .notification-icon {
  background-color: #dc3545;
  color: white;
}

.notification-toast.error .notification-close:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.notification-toast.warning {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.notification-toast.warning .notification-icon {
  background-color: #ffc107;
  color: #212529;
}

.notification-toast.warning .notification-close:hover {
  background-color: rgba(255, 193, 7, 0.1);
}

.notification-toast.info {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.notification-toast.info .notification-icon {
  background-color: #17a2b8;
  color: white;
}

.notification-toast.info .notification-close:hover {
  background-color: rgba(23, 162, 184, 0.1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .notification-toast {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    min-width: auto;
  }
}
</style>
